import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';

export type SchemeInput = {
  name?: string;
  description?: string;
  category?: string;
  department?: string;
  eligibilityCriteria?: string;
  benefits?: string;
  applicationProcess?: string;
  requiredDocuments?: string;
  incomeLimit?: number | null;
  ageLimit?: string | null;
  familySizeLimit?: number | null;
  stateSpecific?: string | null;
  isActive?: boolean;
  sourceUrl?: string;
};

const requiredFields = [
  'name',
  'description',
  'category',
  'department',
  'eligibilityCriteria',
  'benefits',
  'applicationProcess',
  'requiredDocuments'
];

const normalizeDocuments = (value?: string) => {
  if (!value) return '';
  return value
    .split(/[,;|]/)
    .map((d) => d.trim())
    .filter(Boolean)
    .join(', ');
};

export const validateScheme = (input: SchemeInput) => {
  const errors: string[] = [];
  requiredFields.forEach((field) => {
    if (!input[field as keyof SchemeInput]) {
      errors.push(`Missing ${field}`);
    }
  });
  return errors;
};

export const upsertScheme = async (input: SchemeInput) => {
  const data = {
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
    isActive: input.isActive ?? true
  };

  const existing = await prisma.governmentScheme.findFirst({
    where: { name: input.name! }
  });

  if (existing) {
    return prisma.governmentScheme.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.governmentScheme.create({
    data
  });
};

export const importSchemes = async (schemes: SchemeInput[]) => {
  const results: Array<{ name?: string; ok: boolean; errors?: string[] }> = [];
  for (const scheme of schemes) {
    const errors = validateScheme(scheme);
    if (errors.length > 0) {
      results.push({ name: scheme.name, ok: false, errors });
      continue;
    }
    await upsertScheme(scheme);
    results.push({ name: scheme.name, ok: true });
  }
  return results;
};

export const loadJsonFile = (filePath: string) => {
  const fullPath = path.resolve(filePath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
};
