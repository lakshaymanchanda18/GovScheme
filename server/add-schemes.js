const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dev.db');

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
    isActive: 1
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
    isActive: 1
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
    isActive: 1
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
    isActive: 1
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
    isActive: 1
  }
];

// Clear existing data
db.serialize(() => {
  console.log('Clearing existing data...');
  db.run('DELETE FROM eligibility_checks');
  db.run('DELETE FROM applications');
  db.run('DELETE FROM notifications');
  db.run('DELETE FROM government_schemes');
  db.run('DELETE FROM users');
  
  console.log('Adding sample schemes...');
  
  const stmt = db.prepare('INSERT INTO government_schemes (name, description, category, department, eligibilityCriteria, benefits, applicationProcess, requiredDocuments, incomeLimit, ageLimit, familySizeLimit, stateSpecific, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  schemes.forEach(scheme => {
    stmt.run([
      scheme.name,
      scheme.description,
      scheme.category,
      scheme.department,
      scheme.eligibilityCriteria,
      scheme.benefits,
      scheme.applicationProcess,
      scheme.requiredDocuments,
      scheme.incomeLimit,
      scheme.ageLimit,
      scheme.familySizeLimit,
      scheme.stateSpecific,
      scheme.isActive
    ]);
    console.log(`Added scheme: ${scheme.name}`);
  });
  
  stmt.finalize();
  
  console.log('Database seeding completed successfully!');
});

db.close();