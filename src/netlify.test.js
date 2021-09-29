const TOML = require('@iarna/toml');
const { netlifyPluginContent, netlifyTomlContent, netlifyTomlContentStr, patchNetlifyToml } = require('./netlify');

const OPTIONS = {
  templatesDir: 'the-templates',
  openGraphBasePath: '/social-pics',
  slugToImageDataMappingFile: 'map.json'
};

test('netlifyTomlContentStr', () => {
  expect(netlifyTomlContentStr(OPTIONS)).toEqual(`[[plugins]]
package = "@resoc/netlify-plugin-social-image"

  [plugins.inputs]
  templates_dir = "the-templates"
  open_graph_base_path = "/social-pics"
  slug_to_image_data_mapping_file = "map.json"
`);
});

test('patchNetlifyToml', () => {
  // Empty Netlify.toml
  let toml = {};
  expect(patchNetlifyToml(toml, OPTIONS)).toBeTruthy();
  expect(toml).toEqual(netlifyTomlContent(OPTIONS));

  // Existing Netlify.toml, no conflict
  toml = TOML.parse(
`[build]
publish = "_site"
command = "DEBUG=* eleventy"
`
  );
  expect(patchNetlifyToml(toml, OPTIONS)).toBeTruthy();
  expect(toml).toEqual({
    build: {
      publish: '_site',
      command: 'DEBUG=* eleventy'
    },
    ...netlifyTomlContent(OPTIONS)
  });

  // Existing Netlify.toml, existing plugin, not Resoc's
  toml = TOML.parse(
    `[[plugins]]
    package = "some-plugin"
      [plugins.inputs]
      the_input = "Hello"
    `
  );
  expect(patchNetlifyToml(toml, OPTIONS)).toBeTruthy();
  expect(toml).toEqual({
    plugins: [
      {
        package: 'some-plugin',
        inputs: {
          the_input: 'Hello'
        }
      },
      { ...netlifyPluginContent(OPTIONS) }
    ]
  });

  // Existing plugin, no inputs
  toml = TOML.parse(
    `[[plugins]]
    package = "@resoc/netlify-plugin-social-image"
    `
  );
  expect(patchNetlifyToml(toml, OPTIONS)).toBeTruthy();
  expect(toml).toEqual({
    plugins: [
      { ...netlifyPluginContent(OPTIONS) }
    ]
  });

  // Existing plugin, missing and wrong inputs
  toml = TOML.parse(
    `[[plugins]]
    package = "@resoc/netlify-plugin-social-image"
      [plugins.inputs]
      templates_dir = "the-templates"
      open_graph_base_path = "anti-social"
    `
  );
  expect(patchNetlifyToml(toml, OPTIONS)).toBeTruthy();
  expect(toml).toEqual({
    plugins: [
      { ...netlifyPluginContent(OPTIONS) }
    ]
  });

  // Perfect!
  toml = netlifyTomlContent(OPTIONS);
  expect(patchNetlifyToml(toml, OPTIONS)).toBeFalsy();
  expect(toml).toEqual({
    plugins: [
      { ...netlifyPluginContent(OPTIONS) }
    ]
  });
});
