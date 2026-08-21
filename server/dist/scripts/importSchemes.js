"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../src/config/prisma");
const schemeImport_1 = require("../src/services/schemeImport");
const normalizeDocuments = (value) => {
    if (!value)
        return '';
    return value
        .split(/[,;|]/)
        .map((d) => d.trim())
        .filter(Boolean)
        .join(', ');
};
const toCreateInput = (input) => ({
    name: input.name,
    description: input.description,
    category: input.category,
    department: input.department,
    eligibilityCriteria: input.eligibilityCriteria,
    benefits: input.benefits,
    applicationProcess: input.applicationProcess,
    requiredDocuments: normalizeDocuments(input.requiredDocuments),
    sourceUrl: input.sourceUrl ?? null,
    incomeLimit: input.incomeLimit ?? null,
    ageLimit: input.ageLimit ?? null,
    familySizeLimit: input.familySizeLimit ?? null,
    stateSpecific: input.stateSpecific ?? null,
    isActive: input.isActive ?? true,
});
async function replaceSchemes(schemes) {
    const validSchemes = schemes.filter((scheme) => (0, schemeImport_1.validateScheme)(scheme).length === 0);
    const invalidCount = schemes.length - validSchemes.length;
    const batchSize = 100;
    await prisma_1.prisma.governmentScheme.deleteMany({});
    for (let index = 0; index < validSchemes.length; index += batchSize) {
        const batch = validSchemes.slice(index, index + batchSize).map(toCreateInput);
        await prisma_1.prisma.governmentScheme.createMany({ data: batch });
        console.log(`Inserted ${Math.min(index + batch.length, validSchemes.length)} / ${validSchemes.length} schemes`);
    }
    console.log(`Imported ${validSchemes.length} schemes, ${invalidCount} failed validation`);
}
async function main() {
    const replace = process.argv.includes('--replace');
    const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
    const filePath = fileArg || path_1.default.resolve(__dirname, '../../data/schemes.seed.json');
    const schemes = (0, schemeImport_1.loadJsonFile)(filePath);
    if (replace) {
        await replaceSchemes(schemes);
        return;
    }
    const results = await (0, schemeImport_1.importSchemes)(schemes);
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
    await prisma_1.prisma.$disconnect();
});
