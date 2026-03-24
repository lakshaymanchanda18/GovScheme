import path from 'path';
import { importSchemes, loadJsonFile } from '../src/services/schemeImport';

async function main() {
  const filePath = process.argv[2] || path.resolve(__dirname, '../../data/schemes.seed.json');
  const schemes = loadJsonFile(filePath);
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
  });
