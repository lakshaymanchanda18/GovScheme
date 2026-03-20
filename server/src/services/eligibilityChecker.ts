import { prisma } from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
// import { cosineSimilarity } from 'compute-cosine-similarity';

interface EligibilityResult {
  isEligible: boolean;
  confidenceScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  recommendations: string[];
}

export class EligibilityChecker {
  // Simple rule-based eligibility check
  async checkEligibility(userId: string, schemeId: string): Promise<EligibilityResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });

    if (!user || !scheme) {
      throw new Error('User or scheme not found');
    }

    const criteria = this.parseEligibilityCriteria(scheme.eligibilityCriteria);
    const matches = this.evaluateCriteria(user, criteria);
    const confidenceScore = this.calculateConfidenceScore(matches, criteria.length);

    const isEligible = matches.every(match => match.isMatch);

    // Store eligibility check
    await prisma.eligibilityCheck.create({
      data: {
        id: uuidv4(),
        userId,
        schemeId,
        isEligible,
        confidenceScore,
        matchedCriteria: JSON.stringify(matches.filter(m => m.isMatch).map(m => m.criteria)),
        unmatchedCriteria: JSON.stringify(matches.filter(m => !m.isMatch).map(m => m.criteria))
      }
    });

    return {
      isEligible,
      confidenceScore,
      matchedCriteria: matches.filter(m => m.isMatch).map(m => m.criteria),
      unmatchedCriteria: matches.filter(m => !m.isMatch).map(m => m.criteria),
      recommendations: this.generateRecommendations(user, scheme)
    };
  }

  // Get personalized scheme recommendations
  async getRecommendations(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const allSchemes = await prisma.governmentScheme.findMany({
      where: { isActive: true }
    });

    const recommendations = await Promise.all(
      allSchemes.map(async (scheme) => {
        const check = await this.checkEligibility(userId, scheme.id);
        return { ...scheme, ...check, id: scheme.id };
      })
    );

    return recommendations
      .filter(r => r.isEligible || r.confidenceScore > 0.5)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10);
  }

  // Parse eligibility criteria from text
  private parseEligibilityCriteria(criteriaText: string): string[] {
    return criteriaText
      .toLowerCase()
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }

  // Evaluate user against criteria
  private evaluateCriteria(user: any, criteria: string[]): { criteria: string; isMatch: boolean; details: any }[] {
    return criteria.map((criterion) => {
      const isMatch = this.checkCriterion(user, criterion);
      return { criteria: criterion, isMatch, details: isMatch ? 'Matched' : 'Not matched' };
    });
  }

  // Check individual criterion
  private checkCriterion(user: any, criterion: string): boolean {
    const lowerCriterion = criterion.toLowerCase();

    if (lowerCriterion.includes('income') && user.income) {
      return true; // Simplified - in production, parse actual income limits
    }
    if (lowerCriterion.includes('age') && user.dateOfBirth) {
      return true; // Simplified - calculate actual age
    }
    if (lowerCriterion.includes('education') && user.education) {
      return lowerCriterion.includes(user.education.toLowerCase());
    }
    if (lowerCriterion.includes('occupation') && user.occupation) {
      return lowerCriterion.includes(user.occupation.toLowerCase());
    }
    if (lowerCriterion.includes('disability') && user.disability) {
      return lowerCriterion.includes(user.disability.toLowerCase());
    }
    if (lowerCriterion.includes('veteran') && user.veteranStatus) {
      return lowerCriterion.includes(user.veteranStatus.toLowerCase());
    }
    if (lowerCriterion.includes('family size') && user.familySize) {
      return true; // Simplified
    }

    return false;
  }

  // Calculate confidence score
  private calculateConfidenceScore(matches: any[], totalCriteria: number): number {
    const matchedCount = matches.filter(m => m.isMatch).length;
    return matchedCount / totalCriteria;
  }

  // Generate recommendations based on unmatched criteria
  private generateRecommendations(user: any, scheme: any): string[] {
    const recommendations: string[] = [];

    if (user.income && scheme.incomeLimit && user.income > scheme.incomeLimit) {
      recommendations.push('Your income exceeds the scheme limit');
    }
    if (user.education && !scheme.educationCriteria?.includes(user.education)) {
      recommendations.push('Your education level does not match scheme requirements');
    }

    return recommendations;
  }
}

export const eligibilityChecker = new EligibilityChecker();