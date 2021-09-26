const fs = require('fs').promises;
const { fileExists } = require('./utils');

const PACKAGE_JSON = 'package.json';

const printPackageNotice = () => {
  console.log(`Install the Resoc social image Netlify build plugin:`);
  console.log();
  console.log('  npm install --save-dev @resoc/netlify-plugin-social-image');
  console.log();
};

const handlePackageJson = async () => {
  if (!await fileExists(PACKAGE_JSON)) {
    printPackageNotice();
    return false;
  }

  const content = JSON.parse(await fs.readFile(PACKAGE_JSON));
  if (!content['devDependencies'] || !content['devDependencies']['@resoc/netlify-plugin-social-image']) {
    printPackageNotice();
    return false;
  }

  return true;
};

exports.handlePackageJson = handlePackageJson;
