const fs = require('fs').promises;

module.exports = function(config, options) {
  options = Object.assign({
    slugToImageDataMappingFile: 'resoc-image-data.json',
    openGraphBasePath: '/social-images',
    templatesDir: 'resoc-templates'
  }, options);

  const imgData = {};

  config.addShortcode('resoc', ({ ...options } ) => {
    imgData[options.slug] = {
      template: options.template,
      values: options.values
    };
    return `${options.openGraphBasePath}/${options.slug}.jpg`;
  });

  config.on('afterBuild', async () => {
    await fs.writeFile(
      options.slugToImageDataMappingFile,
      JSON.stringify(imgData)
    );
  });
}
