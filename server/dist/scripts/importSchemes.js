"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const schemeImport_1 = require("../src/services/schemeImport");
async function main() {
    const filePath = process.argv[2] || path_1.default.resolve(__dirname, '../../data/schemes.seed.json');
    const schemes = (0, schemeImport_1.loadJsonFile)(filePath);
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
});
