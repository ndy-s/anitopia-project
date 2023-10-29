"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalModals = void 0;
const path = require("path");
const getAllFiles_1 = require("./getAllFiles");
const getLocalModals = (exceptions = []) => {
    let localModalHandler = [];
    const modalHandlerPath = path.join(__dirname, '..', 'commands');
    const modalHandlerCategories = (0, getAllFiles_1.getAllFiles)(modalHandlerPath, true);
    for (const modalHandlerCategory of modalHandlerCategories) {
        if (path.basename(modalHandlerCategory) !== 'modals')
            continue;
        const modalHandlerFiles = (0, getAllFiles_1.getAllFiles)(modalHandlerCategory);
        for (const modalHandlerFile of modalHandlerFiles) {
            const modalHandlerObject = require(modalHandlerFile).default;
            if (exceptions.includes(modalHandlerObject.name))
                continue;
            localModalHandler.push(modalHandlerObject);
        }
    }
    return localModalHandler;
};
exports.getLocalModals = getLocalModals;
