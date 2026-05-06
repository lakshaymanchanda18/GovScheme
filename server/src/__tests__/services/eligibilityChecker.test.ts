import { EligibilityChecker } from '../../services/eligibilityChecker';

describe('EligibilityChecker', () => {
  const checker = new EligibilityChecker();

  // Mock user with all fields populated
  const fullUser = {
    id: 'user-1',
    income: 200000,
    dateOfBirth: new Date('1995-01-15'),
    state: 'Maharashtra',
    education: 'Graduate',
    occupation: 'Farmer',
    familySize: 4,
    disability: null,
    veteranStatus: null,
  };

  // Scheme that matches the full user
  const matchingScheme = {
    id: 'scheme-1',
    name: 'PM Kisan Yojana',
    description: 'Support for farmers',
    category: 'Agriculture',
    department: 'Agriculture',
    eligibilityCriteria: 'income below 300000, age 18-60, farmer',
    benefits: 'Rs 6000 per year',
    applicationProcess: 'Apply online',
    requiredDocuments: 'Aadhar, Land Record',
    incomeLimit: 300000,
    ageLimit: '18-60',
    familySizeLimit: null,
    educationCriteria: null,
    occupationCriteria: 'farmer',
    stateSpecific: null,
    disabilityCriteria: null,
    veteranCriteria: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('evaluate()', () => {
    it('should return eligible for a matching user', () => {
      const result = checker.evaluate(fullUser, matchingScheme);

      expect(result.isEligible).toBe(true);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(result.schemeId).toBe('scheme-1');
      expect(result.schemeName).toBe('PM Kisan Yojana');
      expect(result.matchedCriteria.length).toBeGreaterThan(0);
    });

    it('should return ineligible when income exceeds limit', () => {
      const highIncomeUser = { ...fullUser, income: 500000 };
      const result = checker.evaluate(highIncomeUser, matchingScheme);

      expect(result.unmatchedCriteria.some((c) => c.criteria === 'Income')).toBe(true);
    });

    it('should return ineligible when age is outside range', () => {
      const oldUser = { ...fullUser, dateOfBirth: new Date('1950-01-01') };
      const result = checker.evaluate(oldUser, matchingScheme);

      expect(result.unmatchedCriteria.some((c) => c.criteria === 'Age')).toBe(true);
    });

    it('should handle missing user income gracefully', () => {
      const noIncomeUser = { ...fullUser, income: null };
      const result = checker.evaluate(noIncomeUser, matchingScheme);

      // Should still return a result, not throw
      expect(result.confidenceScore).toBeDefined();
      expect(typeof result.confidenceScore).toBe('number');
    });

    it('should handle scheme with no structured criteria', () => {
      const genericScheme = {
        ...matchingScheme,
        incomeLimit: null,
        ageLimit: null,
        occupationCriteria: null,
        stateSpecific: null,
        educationCriteria: null,
        familySizeLimit: null,
        disabilityCriteria: null,
        veteranCriteria: null,
      };

      const result = checker.evaluate(fullUser, genericScheme);
      expect(result.confidenceScore).toBe(60); // Default 60% for generic schemes
    });

    it('should check state match correctly', () => {
      const stateScheme = { ...matchingScheme, stateSpecific: 'Maharashtra, Gujarat' };
      const result = checker.evaluate(fullUser, stateScheme);

      expect(result.matchedCriteria.some((c) => c.criteria === 'State')).toBe(true);
    });

    it('should fail state check for wrong state', () => {
      const stateScheme = { ...matchingScheme, stateSpecific: 'Kerala, Tamil Nadu' };
      const result = checker.evaluate(fullUser, stateScheme);

      expect(result.unmatchedCriteria.some((c) => c.criteria === 'State')).toBe(true);
    });

    it('should return human-readable explanation', () => {
      const result = checker.evaluate(fullUser, matchingScheme);

      expect(result.explanation).toBeTruthy();
      expect(result.explanation.length).toBeGreaterThan(20);
      expect(result.explanation).toContain('PM Kisan Yojana');
    });

    it('should return recommendations for unmatched criteria', () => {
      const highIncomeUser = { ...fullUser, income: 500000 };
      const result = checker.evaluate(highIncomeUser, matchingScheme);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
