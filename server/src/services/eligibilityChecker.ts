import { prisma } from '../config/prisma';

// ─── TYPES ────────────────────────────────────────────────────

export interface CriteriaMatch {
  criteria: string;
  userValue: string | number | null;
  schemeValue: string | number | null;
  matched: boolean;
}

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  isEligible: boolean;
  confidenceScore: number; // 0-100
  matchedCriteria: CriteriaMatch[];
  unmatchedCriteria: CriteriaMatch[];
  explanation: string;
  recommendations: string[];
}

export interface BulkEligibilityResult {
  totalSchemes: number;
  eligibleSchemes: number;
  schemes: EligibilityResult[];
  topRecommendations: EligibilityResult[];
}

// ─── HELPERS ──────────────────────────────────────────────────

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function parseAgeLimit(ageLimit?: string | null): { min?: number; max?: number } {
  if (!ageLimit) return {};
  const cleaned = ageLimit.replace(/[^\d\-–]/g, '').replace('–', '-');
  const parts = cleaned.split('-').map(Number).filter((n) => !isNaN(n));
  if (parts.length === 0) return {};
  if (parts.length === 1) return { min: parts[0], max: parts[0] };
  return { min: Math.min(...parts), max: Math.max(...parts) };
}

function parseIncomeLimit(incomeLimit: any): number | null {
  if (incomeLimit === null || incomeLimit === undefined) return null;
  const num = Number(incomeLimit);
  return isNaN(num) ? null : num;
}

// ─── ELIGIBILITY WEIGHTS ──────────────────────────────────────

const WEIGHTS = {
  income: 30,
  age: 20,
  state: 15,
  education: 12,
  occupation: 10,
  familySize: 5,
  disability: 4,
  veteran: 4,
} as const;

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

// ─── MAIN CHECKER CLASS ───────────────────────────────────────

export class EligibilityChecker {

  /**
   * Check a single user against a single scheme with detailed results.
   */
  async checkEligibility(userId: string, schemeId: string): Promise<EligibilityResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });

    if (!user) throw new Error('User not found');
    if (!scheme) throw new Error('Scheme not found');

    const result = this.evaluate(user, scheme);

    // Persist the check
    await prisma.eligibilityCheck.create({
      data: {
        userId,
        schemeId,
        isEligible: result.isEligible,
        confidenceScore: result.confidenceScore / 100,
        matchedCriteria: JSON.stringify(result.matchedCriteria),
        unmatchedCriteria: JSON.stringify(result.unmatchedCriteria),
      },
    });

    return result;
  }

  /**
   * Check a user against ALL active schemes.
   */
  async checkAllSchemes(userId: string): Promise<BulkEligibilityResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const schemes = await prisma.governmentScheme.findMany({
      where: { isActive: true },
    });

    const results: EligibilityResult[] = schemes.map((scheme) => this.evaluate(user, scheme));

    // Sort by confidence score descending
    results.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const eligibleSchemes = results.filter((r) => r.isEligible);

    return {
      totalSchemes: schemes.length,
      eligibleSchemes: eligibleSchemes.length,
      schemes: results,
      topRecommendations: results.slice(0, 5),
    };
  }

  /**
   * Get personalized recommendations (schemes with >50% match).
   */
  async getRecommendations(userId: string): Promise<EligibilityResult[]> {
    const bulk = await this.checkAllSchemes(userId);
    return bulk.schemes
      .filter((r) => r.isEligible || r.confidenceScore > 50)
      .slice(0, 10);
  }

  /**
   * Core evaluation logic: check a user object against a scheme's criteria.
   */
  evaluate(user: any, scheme: any): EligibilityResult {
    const matchedCriteria: CriteriaMatch[] = [];
    const unmatchedCriteria: CriteriaMatch[] = [];
    let earnedWeight = 0;
    let applicableWeight = 0;

    // ─── 1. INCOME CHECK ────────────────────────────
    const incomeLimit = parseIncomeLimit(scheme.incomeLimit);
    if (incomeLimit !== null) {
      applicableWeight += WEIGHTS.income;
      const userIncome = user.income ? Number(user.income) : null;

      if (userIncome !== null) {
        if (userIncome <= incomeLimit) {
          earnedWeight += WEIGHTS.income;
          matchedCriteria.push({
            criteria: 'Income',
            userValue: userIncome,
            schemeValue: incomeLimit,
            matched: true,
          });
        } else {
          unmatchedCriteria.push({
            criteria: 'Income',
            userValue: userIncome,
            schemeValue: incomeLimit,
            matched: false,
          });
        }
      } else {
        // No user income data — partial credit
        earnedWeight += WEIGHTS.income * 0.3;
        unmatchedCriteria.push({
          criteria: 'Income',
          userValue: null,
          schemeValue: incomeLimit,
          matched: false,
        });
      }
    }

    // ─── 2. AGE CHECK ───────────────────────────────
    const { min: ageMin, max: ageMax } = parseAgeLimit(scheme.ageLimit);
    if (ageMin !== undefined || ageMax !== undefined) {
      applicableWeight += WEIGHTS.age;
      const userAge = user.dateOfBirth ? calculateAge(new Date(user.dateOfBirth)) : null;

      if (userAge !== null) {
        const meetsMin = ageMin === undefined || userAge >= ageMin;
        const meetsMax = ageMax === undefined || userAge <= ageMax;
        const ageRange = `${ageMin ?? '?'}-${ageMax ?? '?'}`;

        if (meetsMin && meetsMax) {
          earnedWeight += WEIGHTS.age;
          matchedCriteria.push({ criteria: 'Age', userValue: userAge, schemeValue: ageRange, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Age', userValue: userAge, schemeValue: ageRange, matched: false });
        }
      } else {
        earnedWeight += WEIGHTS.age * 0.3;
        unmatchedCriteria.push({
          criteria: 'Age',
          userValue: null,
          schemeValue: `${ageMin ?? '?'}-${ageMax ?? '?'}`,
          matched: false,
        });
      }
    }

    // ─── 3. STATE CHECK ─────────────────────────────
    if (scheme.stateSpecific) {
      applicableWeight += WEIGHTS.state;
      const schemeStates = scheme.stateSpecific.toLowerCase().split(',').map((s: string) => s.trim());

      if (user.state) {
        const userState = user.state.toLowerCase().trim();
        const stateMatch = schemeStates.some((s: string) =>
          s.includes(userState) || userState.includes(s) || s === 'all'
        );

        if (stateMatch) {
          earnedWeight += WEIGHTS.state;
          matchedCriteria.push({ criteria: 'State', userValue: user.state, schemeValue: scheme.stateSpecific, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'State', userValue: user.state, schemeValue: scheme.stateSpecific, matched: false });
        }
      } else {
        earnedWeight += WEIGHTS.state * 0.3;
        unmatchedCriteria.push({ criteria: 'State', userValue: null, schemeValue: scheme.stateSpecific, matched: false });
      }
    }

    // ─── 4. EDUCATION CHECK ─────────────────────────
    if (scheme.educationCriteria) {
      applicableWeight += WEIGHTS.education;
      const criteria = scheme.educationCriteria.toLowerCase();

      if (user.education) {
        const userEdu = user.education.toLowerCase();
        const eduMatch = criteria.includes(userEdu) || userEdu.includes(criteria) ||
          criteria === 'any' || criteria === 'all';

        if (eduMatch) {
          earnedWeight += WEIGHTS.education;
          matchedCriteria.push({ criteria: 'Education', userValue: user.education, schemeValue: scheme.educationCriteria, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Education', userValue: user.education, schemeValue: scheme.educationCriteria, matched: false });
        }
      } else {
        earnedWeight += WEIGHTS.education * 0.3;
        unmatchedCriteria.push({ criteria: 'Education', userValue: null, schemeValue: scheme.educationCriteria, matched: false });
      }
    }

    // ─── 5. OCCUPATION CHECK ────────────────────────
    if (scheme.occupationCriteria) {
      applicableWeight += WEIGHTS.occupation;
      const criteria = scheme.occupationCriteria.toLowerCase();

      if (user.occupation) {
        const userOcc = user.occupation.toLowerCase();
        const occMatch = criteria.includes(userOcc) || userOcc.includes(criteria) ||
          criteria === 'any' || criteria === 'all';

        if (occMatch) {
          earnedWeight += WEIGHTS.occupation;
          matchedCriteria.push({ criteria: 'Occupation', userValue: user.occupation, schemeValue: scheme.occupationCriteria, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Occupation', userValue: user.occupation, schemeValue: scheme.occupationCriteria, matched: false });
        }
      } else {
        earnedWeight += WEIGHTS.occupation * 0.3;
        unmatchedCriteria.push({ criteria: 'Occupation', userValue: null, schemeValue: scheme.occupationCriteria, matched: false });
      }
    }

    // ─── 6. FAMILY SIZE CHECK ───────────────────────
    if (scheme.familySizeLimit) {
      applicableWeight += WEIGHTS.familySize;
      const limit = Number(scheme.familySizeLimit);

      if (user.familySize) {
        if (user.familySize <= limit) {
          earnedWeight += WEIGHTS.familySize;
          matchedCriteria.push({ criteria: 'Family Size', userValue: user.familySize, schemeValue: limit, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Family Size', userValue: user.familySize, schemeValue: limit, matched: false });
        }
      } else {
        earnedWeight += WEIGHTS.familySize * 0.3;
        unmatchedCriteria.push({ criteria: 'Family Size', userValue: null, schemeValue: limit, matched: false });
      }
    }

    // ─── 7. DISABILITY CHECK ────────────────────────
    if (scheme.disabilityCriteria) {
      applicableWeight += WEIGHTS.disability;
      const criteria = scheme.disabilityCriteria.toLowerCase();

      if (user.disability) {
        const userDis = user.disability.toLowerCase();
        const disMatch = criteria.includes(userDis) || userDis.includes(criteria) ||
          criteria === 'any' || criteria === 'yes';

        if (disMatch) {
          earnedWeight += WEIGHTS.disability;
          matchedCriteria.push({ criteria: 'Disability', userValue: user.disability, schemeValue: scheme.disabilityCriteria, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Disability', userValue: user.disability, schemeValue: scheme.disabilityCriteria, matched: false });
        }
      } else {
        unmatchedCriteria.push({ criteria: 'Disability', userValue: null, schemeValue: scheme.disabilityCriteria, matched: false });
      }
    }

    // ─── 8. VETERAN CHECK ───────────────────────────
    if (scheme.veteranCriteria) {
      applicableWeight += WEIGHTS.veteran;
      const criteria = scheme.veteranCriteria.toLowerCase();

      if (user.veteranStatus) {
        const userVet = user.veteranStatus.toLowerCase();
        const vetMatch = criteria.includes(userVet) || userVet.includes(criteria) ||
          criteria === 'any' || criteria === 'yes';

        if (vetMatch) {
          earnedWeight += WEIGHTS.veteran;
          matchedCriteria.push({ criteria: 'Veteran Status', userValue: user.veteranStatus, schemeValue: scheme.veteranCriteria, matched: true });
        } else {
          unmatchedCriteria.push({ criteria: 'Veteran Status', userValue: user.veteranStatus, schemeValue: scheme.veteranCriteria, matched: false });
        }
      } else {
        unmatchedCriteria.push({ criteria: 'Veteran Status', userValue: null, schemeValue: scheme.veteranCriteria, matched: false });
      }
    }

    // ─── SCORE CALCULATION ──────────────────────────

    // If no specific criteria defined, give a base score based on generic eligibility text
    if (applicableWeight === 0) {
      applicableWeight = TOTAL_WEIGHT;
      earnedWeight = TOTAL_WEIGHT * 0.6; // 60% default score for schemes with no structured criteria
    }

    const confidenceScore = Math.round((earnedWeight / applicableWeight) * 100);
    const isEligible = unmatchedCriteria.filter((c) => c.userValue !== null).length === 0 && confidenceScore >= 60;

    // ─── BUILD EXPLANATION ──────────────────────────
    const explanation = this.buildExplanation(scheme.name, matchedCriteria, unmatchedCriteria, confidenceScore, isEligible);
    const recommendations = this.buildRecommendations(unmatchedCriteria);

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      isEligible,
      confidenceScore,
      matchedCriteria,
      unmatchedCriteria,
      explanation,
      recommendations,
    };
  }

  private buildExplanation(
    schemeName: string,
    matched: CriteriaMatch[],
    unmatched: CriteriaMatch[],
    score: number,
    isEligible: boolean
  ): string {
    const parts: string[] = [];

    if (isEligible) {
      parts.push(`You appear to be eligible for "${schemeName}" with a ${score}% match score.`);
    } else {
      parts.push(`You may not be fully eligible for "${schemeName}" (${score}% match).`);
    }

    if (matched.length > 0) {
      parts.push(`✅ You meet: ${matched.map((c) => c.criteria).join(', ')}.`);
    }

    const hardFails = unmatched.filter((c) => c.userValue !== null);
    if (hardFails.length > 0) {
      parts.push(`❌ You don't meet: ${hardFails.map((c) => `${c.criteria} (yours: ${c.userValue}, required: ${c.schemeValue})`).join(', ')}.`);
    }

    const missing = unmatched.filter((c) => c.userValue === null);
    if (missing.length > 0) {
      parts.push(`⚠️ Missing profile data: ${missing.map((c) => c.criteria).join(', ')}. Complete your profile for a more accurate check.`);
    }

    return parts.join(' ');
  }

  private buildRecommendations(unmatched: CriteriaMatch[]): string[] {
    const recs: string[] = [];

    for (const c of unmatched) {
      if (c.userValue === null) {
        recs.push(`Add your ${c.criteria.toLowerCase()} to your profile for a more accurate eligibility check.`);
      } else if (c.criteria === 'Income' && c.userValue && c.schemeValue) {
        recs.push(`Your income (₹${Number(c.userValue).toLocaleString()}) exceeds the scheme limit (₹${Number(c.schemeValue).toLocaleString()}).`);
      } else if (c.criteria === 'Age') {
        recs.push(`Your age (${c.userValue}) is outside the required range (${c.schemeValue}).`);
      }
    }

    return recs;
  }
}

export const eligibilityChecker = new EligibilityChecker();