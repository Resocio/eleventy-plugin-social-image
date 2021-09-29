const fs = require('fs').promises;
const TOML = require('@iarna/toml');
const { fileExists } = require('./utils');

const NETLIFY_TOML = 'netlify.toml';
const NETLIFY_PACKAGE = '@resoc/netlify-plugin-social-image';

const netlifyPluginContent = (options) => ({
  package: NETLIFY_PACKAGE,
  inputs: {
    templates_dir: options.templatesDir,
    open_graph_base_path: options.openGraphBasePath,
    slug_to_image_data_mapping_file: options.slugToImageDataMappingFile
  }
});

const netlifyTomlContent = (options) => ({
  plugins: [ netlifyPluginContent(options) ]
});

const netlifyTomlContentStr = (options) => (
  TOML.stringify(netlifyTomlContent(options))
);

const patchNetlifyToml = (netlifyToml, options) => {
  let updated = false;
  if (!netlifyToml['plugins']) {
    netlifyToml['plugins'] = [];
    updated = true;
  }

  let plugin = netlifyToml['plugins'].find(p => p['package'] === NETLIFY_PACKAGE);
  if (!plugin) {
    plugin = { package: NETLIFY_PACKAGE };
    netlifyToml['plugins'].push(plugin);
    updated = true;
  }

  let inputs = plugin['inputs'];
  if (!inputs) {
    inputs = {};
    plugin['inputs'] = inputs;
    updated = true;
  }

  const params = [
    { name: 'templates_dir', value: options.templatesDir },
    { name: 'open_graph_base_path', value: options.openGraphBasePath },
    { name: 'slug_to_image_data_mapping_file', value: options.slugToImageDataMappingFile }
  ];

  for (const param of params) {
    if (!inputs[param.name] || inputs[param.name] !== param.value) {
      inputs[param.name] = param.value;
      updated = true;
    }
  }

  return updated;
};

const handleNetlifyToml = async (options) => {
  if (await fileExists(NETLIFY_TOML)) {
    const content = (await fs.readFile(NETLIFY_TOML)).toString();
    const netlifyToml = TOML.parse(content);

    if (options.patchNetlifyToml) {
      if (patchNetlifyToml(netlifyToml, options)) {
        console.log(`${NETLIFY_TOML} updated to configure ${NETLIFY_PACKAGE}`);
        await fs.writeFile(NETLIFY_TOML, TOML.stringify(netlifyToml));
      }
      return true;
    }

    if (!netlifyToml['plugins']) {
      console.log(`Append plugin configuration to ${NETLIFY_TOML}`);
      await fs.appendFile(NETLIFY_TOML, netlifyTomlContentStr(options));
      return true;
    } else {
      const plugin = netlifyToml['plugins'].find(p => p['package'] === NETLIFY_PACKAGE);
      if (!plugin) {
        console.log(`Edit ${NETLIFY_TOML} and declare plugin ${NETLIFY_PACKAGE}:`);
        console.log();
        console.log(netlifyTomlContentStr(options));
        return false;
      }

      const inputs = plugin['inputs'];
      if (!inputs) {
        console.log(`Edit ${NETLIFY_TOML} and declare plugin ${NETLIFY_PACKAGE} inputs:`);
        console.log();
        console.log(netlifyTomlContentStr(options));
        return false;
      }

      const params = [
        { name: 'templates_dir', value: options.templatesDir },
        { name: 'open_graph_base_path', value: options.openGraphBasePath },
        { name: 'slug_to_image_data_mapping_file', value: options.slugToImageDataMappingFile }
      ];

      for (const param of params) {
        if (!inputs[param.name] || inputs[param.name] !== param.value) {
          console.log(`In ${NETLIFY_TOML}, plugin ${NETLIFY_PACKAGE}, set input ${param.name} to "${param.value}"`)
          console.log();
          console.log(`The plugin configuration should be similar to:`);
          console.log();
          console.log(netlifyTomlContentStr(options));
          return false;
        }
      }

      return true;
    }
  } else {
    console.log(`Create and initialize ${NETLIFY_TOML}`);
    await fs.writeFile(NETLIFY_TOML, netlifyTomlContentStr(options));
    return true;
  }
};

exports.NETLIFY_PACKAGE = NETLIFY_PACKAGE;
exports.patchNetlifyToml = patchNetlifyToml;
exports.netlifyPluginContent = netlifyPluginContent;
exports.netlifyTomlContent = netlifyTomlContent;
exports.netlifyTomlContentStr = netlifyTomlContentStr;
exports.handleNetlifyToml = handleNetlifyToml;
