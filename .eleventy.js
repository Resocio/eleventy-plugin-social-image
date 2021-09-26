const fs = require('fs').promises;
const { handleGitIgnore } = require('./src/gitignore');
const { handleNetlifyToml } = require('./src/netlify');
const { handlePackageJson } = require('./src/package');

module.exports = function(config, options) {
  options = Object.assign({
    slugToImageDataMappingFile: 'resoc-image-data.json',
    openGraphBasePath: '/social-images',
    templatesDir: 'resoc-templates'
  }, options);

  const imgData = {};

  config.on('beforeBuild', async () => {
    handleGitIgnore(options.slugToImageDataMappingFile);
  });

  config.addShortcode('resoc', ({ ...options } ) => {
    imgData[options.slug] = {
      template: options.template,
      values: options.values
    };
    return `${options.openGraphBasePath}/${options.slug}.jpg`;
  });

  config.on('afterBuild', async () => {
    if (!await handleNetlifyToml(options)) {
      throw 'Please fix your Netlify configuration';
    }
    if (!await handlePackageJson()) {
      throw 'Please install the Resoc social image Netlify build plugin';
    }

    await fs.writeFile(
      options.slugToImageDataMappingFile,
      JSON.stringify(imgData)
    );
  });
}
