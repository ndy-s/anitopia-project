const fs = require('fs'); // File system module
const path = require('path');

module.exports = (directory, foldersOnly = false) => {
    let fileNames = [];

    // Read the contents of the directory and get an array of file/folder information
    const files = fs.readdirSync(directory, {withFileTypes: true});

    // Iterate through each file/folder information object
    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (foldersOnly) {
            if (file.isDirectory()) {
                fileNames.push(filePath);
            }
        } else {
            if (file.isFile()) {
                fileNames.push(filePath);
            }
        }
    }

    return fileNames;
};