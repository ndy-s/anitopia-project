"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const info_1 = require("../character/info");
exports.default = {
    name: "infoCharaModal",
    callback: async (client, interaction) => {
        try {
            const charaIdInput = interaction.fields.getTextInputValue('charaIdInput').toUpperCase();
            await info_1.default.callback(client, interaction, charaIdInput);
        }
        catch (error) {
            console.log(`Handle Submit Modal infoCharaModal Error: ${error}`);
        }
    }
};
