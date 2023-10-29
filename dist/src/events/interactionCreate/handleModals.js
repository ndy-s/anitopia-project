"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
exports.default = async (client, interaction) => {
    if (!interaction.isModalSubmit())
        return;
    try {
        const localModalHandler = (0, utils_1.getLocalModals)();
        const modalHandlerObject = localModalHandler.find((mdl) => mdl.name === interaction.customId);
        await modalHandlerObject.callback(client, interaction);
    }
    catch (error) {
        console.log(`There was an error running this modal submit handler: ${error}`);
    }
};
