// Validate google-services.json exists and package_name matches
const fs = require('fs');
const path = require('path');

const candidates = [
  process.env.EXPO_ANDROID_GOOGLE_SERVICES_FILE,
  './android/app/google-services.json',
  './google-services.json',
].filter(Boolean);

const found = candidates.find((p) => fs.existsSync(path.resolve(p)));
if (!found) {
  console.error('\nERROR: google-services.json not found.\nPlace the file in project root or android/app, or set EXPO_ANDROID_GOOGLE_SERVICES_FILE.\n');
  process.exit(1);
}

try {
  const json = JSON.parse(fs.readFileSync(path.resolve(found), 'utf8'));
  const pkg = json?.client?.[0]?.client_info?.android_client_info?.package_name;
  if (pkg !== 'com.gumarang.mobile') {
    console.error(`\nERROR: package_name in ${found} is "${pkg}". Expected "com.gumarang.mobile".\n`);
    process.exit(2);
  }
  console.log(`OK: Found ${found} and package_name matches (com.gumarang.mobile).`);
} catch (err) {
  console.error('\nERROR: Failed to parse google-services.json:', err);
  process.exit(3);
}
