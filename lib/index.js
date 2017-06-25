const path = require('path');
const childProcess = require('child_process');
const ADAPTER_ID = 'simian-picture-adapter';

// For now, we just rely on comparing file extensions
const VALID_EXTENSIONS = [
  '.CR2',
  '.JPG',
  '.JPEG',
  '.PNG',
  '.BMP'
];

/**
 * Internal utility function to execute a bash command and capture the output as a string.
 * @param {string} strCmd - the command to be executed.
 * @return {Object} - a promise that resolves into the string outout of the command.
 */
function runCommand(strCmd) {
  return new Promise(function getExifInner(resolve, reject) {
    childProcess.exec(strCmd, {}, function(err, stdOut) {
      if (err) {
        console.error(`Failed for command: ${strCmd}`, err);
        reject(err);
      } else
        resolve(stdOut.toString());
    });
  });
}

function isImageFile(srcPath) {
  const extension = path.extname(srcPath.toUpperCase());
  const isImage = VALID_EXTENSIONS.indexOf(extension) !== -1;
  return Promise.resolve(isImage);
}

async function getExif(srcPath) {
  const cmd = `exiftool -j "${srcPath}"`;
  const outPut = await runCommand(cmd);
  const outArr = JSON.parse(outPut);
  return outArr[0];
}

async function getHash(srcPath) {
  return await runCommand(`md5sum -b "${srcPath}"`);
}

/**
 * @param {string} srcPath - the file for which the metadata is required.
 * @returns {Object} a promise
 */
async function getMetadata(srcPath) {
  const isImage = await isImageFile(srcPath);
  if (isImage) {
    const [
      exif,
      hash
    ] = await Promise.all([
        getExif(srcPath),
        getHash(srcPath)
      ]);

    return {
      filePath: srcPath,
      hash,
      exif,
      adapterId: getAdapterId(),
      type: 'picture'
    };
  }

  return false;
}

function getAdapterId() {
  return ADAPTER_ID;
}

module.exports = {
  getAdapterId,
  getMetadata
};
