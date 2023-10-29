"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = void 0;
const fs = require("fs");
const path = require("path");
const getAllFiles = (directory, foldersOnly = false) => {
    let fileNames = [];
    try {
        const files = fs.readdirSync(directory, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(directory, file.name);
            if (foldersOnly) {
                if (file.isDirectory()) {
                    fileNames.push(filePath);
                }
            }
            else {
                if (file.isFile()) {
                    fileNames.push(filePath);
                }
            }
        }
    }
    catch (error) {
        console.error(`Error reading directory ${directory}: ${error}`);
    }
    return fileNames;
};
exports.getAllFiles = getAllFiles;
