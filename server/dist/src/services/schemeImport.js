"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJsonFile = exports.importSchemes = exports.upsertScheme = exports.validateScheme = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../config/prisma");
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
const normalizeDocuments = (value) => {
    if (!value)
        return '';
    return value
        .split(/[,;|]/)
        .map((d) => d.trim())
        .filter(Boolean)
        .join(', ');
};
const validateScheme = (input) => {
    const errors = [];
    requiredFields.forEach((field) => {
        if (!input[field]) {
            errors.push(`Missing ${field}`);
        }
    });
    return errors;
};
exports.validateScheme = validateScheme;
const upsertScheme = async (input) => {
    const data = {
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
        isActive: input.isActive ?? true
    };
    const existing = await prisma_1.prisma.governmentScheme.findFirst({
        where: { name: input.name }
    });
    if (existing) {
        return prisma_1.prisma.governmentScheme.update({
            where: { id: existing.id },
            data
        });
    }
    return prisma_1.prisma.governmentScheme.create({
        data
    });
};
exports.upsertScheme = upsertScheme;
const importSchemes = async (schemes) => {
    const results = [];
    for (const scheme of schemes) {
        const errors = (0, exports.validateScheme)(scheme);
        if (errors.length > 0) {
            results.push({ name: scheme.name, ok: false, errors });
            continue;
        }
        await (0, exports.upsertScheme)(scheme);
        results.push({ name: scheme.name, ok: true });
    }
    return results;
};
exports.importSchemes = importSchemes;
const loadJsonFile = (filePath) => {
    const fullPath = path_1.default.resolve(filePath);
    const raw = fs_1.default.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
};
exports.loadJsonFile = loadJsonFile;
