const fs = require('fs').promises;

const GITIGNORE = '.gitignore';

const fileExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  }
  catch (e) {
    return false;
  }
};

const fileAlreadyIgnored = async (filePath) => {
  const content = await fs.readFile(GITIGNORE);
  const lines = content.toString().split(/\r?\n/);
  return lines.includes(filePath);
}

const ignoreContent = (imgDataFilePath) => (
  `\n# Resoc image data mapping file\n${imgDataFilePath}\n`
);

const handleGitIgnore = async (imgDataFilePath) => {
  if (await fileExists(GITIGNORE)) {
    if (await fileAlreadyIgnored(imgDataFilePath)) {
      return;
    } else {
      console.log(`Add ${imgDataFilePath} to ${GITIGNORE}`);
      await fs.appendFile(GITIGNORE, ignoreContent(imgDataFilePath));
    }
  } else {
    console.log(`Create ${GITIGNORE} to ignore ${imgDataFilePath}`);
    await fs.writeFile(GITIGNORE, ignoreContent(imgDataFilePath));
  }
}

exports.handleGitIgnore = handleGitIgnore;
