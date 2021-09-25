const fs = require('fs').promises;

module.exports = function(config) {
  const data = {};

  config.addShortcode('resoc', ({ ...options } ) => {
    data[options.slug] = {
      template: options.template,
      values: options.values
    };
    return `/social-images/${options.slug}.jpg`;
  });

  config.on('afterBuild', async () => {
    await fs.writeFile(
      'resoc-image-data.json',
      JSON.stringify(data)
    );
  });
}
