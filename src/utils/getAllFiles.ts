import * as fs from 'fs';
import * as path from 'path';

export const getAllFiles = (directory: string, foldersOnly = false): string[] => {
    const fileNames: string[] = [];

    try {
        const files = fs.readdirSync(directory, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(directory, file.name);

            if ((foldersOnly && file.isDirectory()) || (!foldersOnly && file.isFile())) {
                fileNames.push(filePath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${directory}: ${error}`);
    }

    return fileNames;
};
