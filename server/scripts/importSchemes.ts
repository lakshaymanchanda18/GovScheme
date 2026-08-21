import path from 'path';
import { prisma } from '../src/config/prisma';
import { importSchemes, loadJsonFile, validateScheme, SchemeInput } from '../src/services/schemeImport';

const normalizeDocuments = (value?: string) => {
  if (!value) return '';
  return value
    .split(/[,;|]/)
    .map((d) => d.trim())
    .filter(Boolean)
    .join(', ');
};

const toCreateInput = (input: SchemeInput) => ({
  name: input.name!,
  description: input.description!,
  category: input.category!,
  department: input.department!,
  eligibilityCriteria: input.eligibilityCriteria!,
  benefits: input.benefits!,
  applicationProcess: input.applicationProcess!,
  requiredDocuments: normalizeDocuments(input.requiredDocuments),
  sourceUrl: input.sourceUrl ?? null,
  incomeLimit: input.incomeLimit ?? null,
  ageLimit: input.ageLimit ?? null,
  familySizeLimit: input.familySizeLimit ?? null,
  stateSpecific: input.stateSpecific ?? null,
  isActive: input.isActive ?? true,
});

async function replaceSchemes(schemes: SchemeInput[]) {
  const validSchemes = schemes.filter((scheme) => validateScheme(scheme).length === 0);
  const invalidCount = schemes.length - validSchemes.length;
  const batchSize = 100;

  await prisma.governmentScheme.deleteMany({});

  for (let index = 0; index < validSchemes.length; index += batchSize) {
    const batch = validSchemes.slice(index, index + batchSize).map(toCreateInput);
    await prisma.governmentScheme.createMany({ data: batch });
    console.log(`Inserted ${Math.min(index + batch.length, validSchemes.length)} / ${validSchemes.length} schemes`);
  }

  console.log(`Imported ${validSchemes.length} schemes, ${invalidCount} failed validation`);
}

async function main() {
  const replace = process.argv.includes('--replace');
  const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  const filePath = fileArg || path.resolve(__dirname, '../../data/schemes.seed.json');
  const schemes = loadJsonFile(filePath);

  if (replace) {
    await replaceSchemes(schemes);
    return;
  }

  const results = await importSchemes(schemes);
  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;
  console.log(`Imported ${okCount} schemes, ${failCount} failed`);
  if (failCount > 0) {
    console.log('Failures:', results.filter((r) => !r.ok));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
