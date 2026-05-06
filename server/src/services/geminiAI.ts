/**
 * Gemini AI-powered eligibility analysis and scheme recommendation service.
 * Uses Google's Generative AI (Gemini) for intelligent, personalized explanations.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';
import { eligibilityChecker, EligibilityResult } from './eligibilityChecker';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

interface AIEligibilityInput {
  userId?: string;
  personalInfo?: {
    age?: number;
    state?: string;
    familySize?: number;
    education?: string;
    occupation?: string;
  };
  financialInfo?: {
    income?: number;
  };
  additionalInfo?: {
    disability?: string;
    veteranStatus?: string;
    caste?: string;
  };
}

interface AIEligibilityResponse {
  isEligible: boolean;
  confidenceScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  aiExplanation: string;
  recommendedSchemes: Array<{
    id: string;
    name: string;
    matchPercentage: number;
    benefits: string;
    whyRecommended: string;
  }>;
  documentSuggestions: string[];
  improvementTips: string[];
}

/**
 * Calculate age from DOB.
 */
function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Build a user profile from request body + database user data.
 */
async function buildUserProfile(input: AIEligibilityInput): Promise<Record<string, any>> {
  const profile: Record<string, any> = {
    age: input.personalInfo?.age,
    state: input.personalInfo?.state,
    familySize: input.personalInfo?.familySize,
    education: input.personalInfo?.education,
    occupation: input.personalInfo?.occupation,
    income: input.financialInfo?.income,
    disability: input.additionalInfo?.disability,
    veteranStatus: input.additionalInfo?.veteranStatus,
    caste: input.additionalInfo?.caste,
  };

  // Merge with database user data if userId provided
  if (input.userId) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (user) {
      profile.state = profile.state || user.state || undefined;
      profile.familySize = profile.familySize || user.familySize || undefined;
      profile.education = profile.education || user.education || undefined;
      profile.occupation = profile.occupation || user.occupation || undefined;
      profile.income = profile.income || (user.income ? Number(user.income) : undefined);
      profile.disability = profile.disability || user.disability || undefined;
      profile.veteranStatus = profile.veteranStatus || user.veteranStatus || undefined;
      if (!profile.age && user.dateOfBirth) {
        profile.age = calculateAge(user.dateOfBirth);
      }
    }
  }

  return profile;
}

/**
 * Run rule-based eligibility first, then enhance with Gemini AI explanation.
 */
export async function aiEligibilityCheck(input: AIEligibilityInput): Promise<AIEligibilityResponse> {
  const profile = await buildUserProfile(input);

  // Get all active schemes
  const schemes = await prisma.governmentScheme.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  // Run rule-based scoring for each scheme
  const scored: EligibilityResult[] = schemes.map((scheme) =>
    eligibilityChecker.evaluate(
      { ...profile, dateOfBirth: profile.age ? new Date(Date.now() - profile.age * 365.25 * 24 * 60 * 60 * 1000) : null },
      scheme
    )
  );

  scored.sort((a, b) => b.confidenceScore - a.confidenceScore);

  const topSchemes = scored.slice(0, 5);
  const best = topSchemes[0];

  // Build recommended schemes
  const recommendedSchemes = topSchemes
    .filter((s) => s.confidenceScore > 30)
    .map((s) => {
      const scheme = schemes.find((sc) => sc.id === s.schemeId)!;
      return {
        id: s.schemeId,
        name: s.schemeName,
        matchPercentage: s.confidenceScore,
        benefits: scheme.benefits,
        whyRecommended: s.matchedCriteria.map((c) => c.criteria).join(', ') || 'General eligibility',
      };
    });

  // Document suggestions from best matching scheme
  const bestScheme = best ? schemes.find((s) => s.id === best.schemeId) : null;
  const documentSuggestions = bestScheme?.requiredDocuments
    ? bestScheme.requiredDocuments.split(',').map((d: string) => d.trim()).filter(Boolean)
    : [];

  // Generate AI explanation using Gemini
  let aiExplanation = best?.explanation || 'Complete your profile to get personalized scheme recommendations.';
  let improvementTips: string[] = best?.recommendations || [];

  if (genAI && topSchemes.length > 0) {
    try {
      const aiResult = await generateGeminiExplanation(profile, topSchemes, schemes);
      aiExplanation = aiResult.explanation;
      improvementTips = aiResult.tips;
    } catch (error) {
      console.error('Gemini AI explanation failed, using rule-based fallback:', error);
    }
  }

  return {
    isEligible: best?.isEligible || false,
    confidenceScore: best?.confidenceScore || 0,
    matchedCriteria: best?.matchedCriteria.filter((c) => c.matched).map((c) => c.criteria) || [],
    unmatchedCriteria: best?.unmatchedCriteria.filter((c) => !c.matched).map((c) => c.criteria) || [],
    aiExplanation,
    recommendedSchemes,
    documentSuggestions,
    improvementTips,
  };
}

/**
 * Use Gemini to generate a personalized, human-readable explanation.
 */
async function generateGeminiExplanation(
  profile: Record<string, any>,
  topResults: EligibilityResult[],
  schemes: any[]
): Promise<{ explanation: string; tips: string[] }> {
  if (!genAI) {
    return {
      explanation: topResults[0]?.explanation || '',
      tips: topResults[0]?.recommendations || [],
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const schemeSummaries = topResults.slice(0, 3).map((r) => {
    const scheme = schemes.find((s) => s.id === r.schemeId);
    return `- ${r.schemeName} (${r.confidenceScore}% match): ${scheme?.benefits?.substring(0, 200) || 'N/A'}`;
  });

  const prompt = `You are a helpful Indian government schemes advisor. Based on the user's profile and eligibility results, provide a brief, empathetic, and actionable explanation in 3-4 sentences.

User Profile:
- Age: ${profile.age || 'Not provided'}
- State: ${profile.state || 'Not provided'}
- Income: ${profile.income ? `₹${Number(profile.income).toLocaleString('en-IN')}` : 'Not provided'}
- Education: ${profile.education || 'Not provided'}
- Occupation: ${profile.occupation || 'Not provided'}
- Family Size: ${profile.familySize || 'Not provided'}

Top Matching Schemes:
${schemeSummaries.join('\n')}

Matched Criteria: ${topResults[0]?.matchedCriteria.map((c) => c.criteria).join(', ') || 'None'}
Unmatched Criteria: ${topResults[0]?.unmatchedCriteria.map((c) => c.criteria).join(', ') || 'None'}

Provide:
1. A personalized explanation (3-4 sentences, simple language, encouraging tone)
2. 2-3 specific improvement tips

Format your response as JSON:
{"explanation": "...", "tips": ["tip1", "tip2"]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation || topResults[0]?.explanation || '',
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      };
    }
  } catch (error) {
    console.error('Gemini parse error:', error);
  }

  return {
    explanation: topResults[0]?.explanation || '',
    tips: topResults[0]?.recommendations || [],
  };
}
