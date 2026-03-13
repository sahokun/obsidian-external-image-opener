import { readFileSync, writeFileSync } from 'fs';

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: npm run bump -- <new-version>');
  console.error('Example: npm run bump -- 1.0.1');
  process.exit(1);
}

if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(newVersion)) {
  console.error(`Invalid version format: ${newVersion} (expected x.y.z)`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const minAppVersion = manifest.minAppVersion;
manifest.version = newVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');

const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
versions[newVersion] = minAppVersion;
writeFileSync('versions.json', JSON.stringify(versions, null, 2) + '\n');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.version = newVersion;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

const pkgLock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
pkgLock.version = newVersion;
if (pkgLock.packages && pkgLock.packages['']) {
  pkgLock.packages[''].version = newVersion;
}
writeFileSync('package-lock.json', JSON.stringify(pkgLock, null, 2) + '\n');

console.log(`Version bumped to ${newVersion}`);
