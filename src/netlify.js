const fs = require('fs').promises;
const toml = require('toml');
const { fileExists } = require('./utils');

const NETLIFY_TOML = 'netlify.toml';
const NETLIFY_PACKAGE = '@resoc/netlify-plugin-social-image';

const netlifyTomlContent = (options) => (
  `[[plugins]]
  package = "${NETLIFY_PACKAGE}"
  [plugins.inputs]
    templates_dir = "${options.templatesDir}"
    open_graph_base_path = "${options.openGraphBasePath}"
    slug_to_image_data_mapping_file = "${options.slugToImageDataMappingFile}"
`
);

const handleNetlifyToml = async (options) => {
  if (await fileExists(NETLIFY_TOML)) {
    const content = (await fs.readFile(NETLIFY_TOML)).toString();
    var netlifyToml = toml.parse(content);
    if (!netlifyToml['plugins']) {
      console.log(`Append plugin configuration to ${NETLIFY_TOML}`);
      await fs.appendFile(NETLIFY_TOML, netlifyTomlContent(options));
      return true;
    } else {
      const plugin = netlifyToml['plugins'].find(p => p['package'] === NETLIFY_PACKAGE);
      if (!plugin) {
        console.log(`Edit ${NETLIFY_TOML} and declare plugin ${NETLIFY_PACKAGE}:`);
        console.log();
        console.log(netlifyTomlContent(options));
        return false;
      }

      const inputs = plugin['inputs'];
      if (!inputs) {
        console.log(`Edit ${NETLIFY_TOML} and declare plugin ${NETLIFY_PACKAGE} inputs:`);
        console.log();
        console.log(netlifyTomlContent(options));
        return false;
      }

      const params = [
        { name: 'templates_dir', value: options.templatesDir },
        { name: 'open_graph_base_path', value: options.openGraphBasePath },
        { name: 'slug_to_image_data_mapping_file', value: options.slugToImageDataMappingFile }
      ];

      for (const param of params) {
        if (!inputs[param.name] || inputs[param.name] !== param.value) {
          console.log(`In ${NETLIFY_TOML}, plugin ${NETLIFY_PACKAGE}, set input ${param.name} to ${param.value}`)
          console.log();
          console.log(`The plugin configuration should be similar to:`);
          console.log();
          console.log(netlifyTomlContent(options));
          return false;
        }
      }

      return true;
    }
  } else {
    console.log(`Create and initialize ${NETLIFY_TOML}`);
    await fs.writeFile(NETLIFY_TOML, netlifyTomlContent(options));
    return true;
  }
};

exports.handleNetlifyToml = handleNetlifyToml;
