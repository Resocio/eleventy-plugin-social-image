const fs = require('fs').promises;

exports.fileExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  }
  catch (e) {
    return false;
  }
};
