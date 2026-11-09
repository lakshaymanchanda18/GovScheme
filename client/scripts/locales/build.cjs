// scripts/locales/build.cjs
const fs = require('fs');
const path = require('path');

const dataCommon = require('./data-common.cjs');
const dataAuth = require('./data-auth.cjs');
const dataSchemes = require('./data-schemes.cjs');
const dataLanding = require('./data-landing.cjs');
const dataFeatures = require('./data-features.cjs');

const LANGS = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'ml', 'kn', 'ur', 'as', 'or'];
const OUT_DIR = path.resolve(__dirname, '../../src/locales');

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(flattenKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const bundles = {};

for (const lang of LANGS) {
  bundles[lang] = {
    common: dataCommon.common[lang],
    navigation: dataCommon.navigation[lang],
    auth: dataAuth.auth[lang],
    landing: dataLanding.landing[lang],
    schemes: dataSchemes.schemes[lang],
    dashboard: dataSchemes.dashboard[lang],
    eligibility: dataFeatures.eligibility[lang],
    applications: dataFeatures.applications[lang],
    profile: dataAuth.profile[lang],
    admin: dataFeatures.admin[lang],
    chatbot: dataFeatures.chatbot[lang],
    notifications: dataCommon.notifications[lang],
    footer: dataCommon.footer[lang],
    language: dataCommon.language[lang]
  };
}

// Validate key symmetry
const enKeys = new Set(flattenKeys(bundles['en']));
console.log(`[Validator] Canonical EN key count: ${enKeys.size}`);

let hasErrors = false;
for (const lang of LANGS) {
  if (lang === 'en') continue;
  const langKeys = new Set(flattenKeys(bundles[lang]));
  
  const missing = [...enKeys].filter(k => !langKeys.has(k));
  const unexpected = [...langKeys].filter(k => !enKeys.has(k));

  if (missing.length > 0) {
    console.error(`[Error] ${lang} is missing keys:`, missing);
    hasErrors = true;
  }
  if (unexpected.length > 0) {
    console.error(`[Error] ${lang} has unexpected keys:`, unexpected);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('[Error] Key validation failed. Please fix missing keys.');
  process.exit(1);
}

console.log('[Validator] 100% key parity confirmed across all 13 languages!');

// Write JSON files
for (const lang of LANGS) {
  const filePath = path.join(OUT_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(bundles[lang], null, 2) + '\n', 'utf8');
  console.log(`[Generated] ${filePath} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
}

console.log(`\nSuccessfully built all ${LANGS.length} locale JSON files.`);

