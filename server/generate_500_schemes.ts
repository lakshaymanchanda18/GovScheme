import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const categories = ['Agriculture', 'Education', 'Healthcare', 'Energy', 'Housing', 'Business', 'Financial Inclusion', 'Employment'];
const departments = ['Ministry of Finance', 'Ministry of Education', 'Ministry of Health', 'Ministry of Agriculture', 'Ministry of Power', 'Ministry of Housing and Urban Affairs'];
const stateSpecifics = ['All States', 'Maharashtra', 'Karnataka', 'Delhi', 'Uttar Pradesh', 'Gujarat'];

async function main() {
  console.log('Generating 500 schemes...');
  
  const schemes = [];
  
  for (let i = 0; i < 500; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    schemes.push({
      name: `Pradhan Mantri ${faker.word.words(2)} Yojana ${i+1}`,
      description: faker.lorem.paragraph(),
      category: category,
      department: department,
      eligibilityCriteria: faker.lorem.sentences(2),
      benefits: faker.lorem.sentences(2),
      applicationProcess: 'Apply online through the official portal or offline via CSC centers.',
      requiredDocuments: 'Aadhaar Card, PAN Card, Income Certificate',
      sourceUrl: 'https://www.myscheme.gov.in/',
      incomeLimit: Math.random() > 0.5 ? Math.floor(Math.random() * 1000000) : null,
      ageLimit: '18-60 years',
      familySizeLimit: Math.random() > 0.8 ? 4 : null,
      stateSpecific: stateSpecifics[Math.floor(Math.random() * stateSpecifics.length)],
      isActive: true,
    });
  }

  // Use createMany if supported, otherwise loop
  for (const scheme of schemes) {
    await prisma.governmentScheme.create({ data: scheme });
  }

  const count = await prisma.governmentScheme.count();
  console.log(`Successfully seeded! Total schemes in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
