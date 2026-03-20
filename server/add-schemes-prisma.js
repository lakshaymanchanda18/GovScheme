const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSchemes() {
  try {
    console.log('Adding sample government schemes...');

    // Delete existing data
    await prisma.eligibilityCheck.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.governmentScheme.deleteMany({});
    await prisma.user.deleteMany({});

    // Create sample government schemes
    const schemes = [
      {
        name: 'Pradhan Mantri Awas Yojana (PMAY)',
        description: 'Housing scheme for urban poor providing financial assistance for construction of houses.',
        category: 'Housing',
        department: 'Ministry of Housing and Urban Affairs',
        eligibilityCriteria: 'Annual income up to ₹6 lakh for EWS, ₹6-12 lakh for LIG, ₹12-18 lakh for MIG',
        benefits: 'Interest subsidy on home loans up to ₹2.67 lakh',
        applicationProcess: 'Apply through PMAY portal with required documents',
        requiredDocuments: 'Aadhar card, Income certificate, Bank account details',
        incomeLimit: 1800000,
        ageLimit: '18-60 years',
        familySizeLimit: 4,
        stateSpecific: 'All States',
        isActive: true
      },
      {
        name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
        description: 'Financial inclusion program to ensure access to financial services for all households.',
        category: 'Financial Inclusion',
        department: 'Ministry of Finance',
        eligibilityCriteria: 'Any Indian citizen above 10 years of age',
        benefits: 'Zero balance bank account, RuPay debit card, overdraft facility',
        applicationProcess: 'Visit any bank branch with KYC documents',
        requiredDocuments: 'Aadhar card, PAN card, Address proof',
        incomeLimit: null,
        ageLimit: '10+ years',
        familySizeLimit: null,
        stateSpecific: 'All States',
        isActive: true
      },
      {
        name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        description: 'Income support scheme for small and marginal farmers.',
        category: 'Agriculture',
        department: 'Ministry of Agriculture and Farmers Welfare',
        eligibilityCriteria: 'Small and marginal farmers owning cultivable land up to 2 hectares',
        benefits: 'Direct income support of ₹6,000 per year in three equal installments',
        applicationProcess: 'Register through Common Service Centers or online portal',
        requiredDocuments: 'Land ownership documents, Aadhar card, Bank account details',
        incomeLimit: null,
        ageLimit: '18+ years',
        familySizeLimit: null,
        stateSpecific: 'All States',
        isActive: true
      },
      {
        name: 'Ayushman Bharat Yojana (PM-JAY)',
        description: 'World\'s largest health insurance scheme providing coverage for secondary and tertiary care hospitalization.',
        category: 'Healthcare',
        department: 'Ministry of Health and Family Welfare',
        eligibilityCriteria: 'Families identified as deprived rural families and selected occupational categories of urban workers',
        benefits: 'Health insurance coverage up to ₹5 lakh per family per year',
        applicationProcess: 'Automatic enrollment based on SECC 2011 data or through e-card generation',
        requiredDocuments: 'Aadhar card, Ration card, Mobile number',
        incomeLimit: null,
        ageLimit: 'All ages',
        familySizeLimit: null,
        stateSpecific: 'All States',
        isActive: true
      },
      {
        name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        description: 'Clean cooking fuel scheme providing LPG connections to women from below poverty line households.',
        category: 'Energy',
        department: 'Ministry of Petroleum and Natural Gas',
        eligibilityCriteria: 'Women head of family from BPL households',
        benefits: 'Free LPG connection with financial support of ₹1600',
        applicationProcess: 'Apply through nearest LPG distributor with required documents',
        requiredDocuments: 'Aadhar card, BPL certificate, Bank account details',
        incomeLimit: null,
        ageLimit: '18+ years',
        familySizeLimit: null,
        stateSpecific: 'All States',
        isActive: true
      }
    ];

    // Create schemes in database
    for (const schemeData of schemes) {
      await prisma.governmentScheme.create({
        data: schemeData
      });
      console.log(`Created scheme: ${schemeData.name}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSchemes();