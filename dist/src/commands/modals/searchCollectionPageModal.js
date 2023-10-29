"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("../character/collection");
const models_1 = require("../../models");
const exceptions_1 = require("../exceptions");
const utils_1 = require("../../utils");
exports.default = {
    name: "searchCollectionPageModal",
    callback: async (client, interaction) => {
        try {
            const pageInput = Number(interaction.fields.getTextInputValue('pageInput'));
            const player = await (0, utils_1.getPlayer)(interaction);
            const PAGE_SIZE = 12;
            const totalDocuments = await models_1.CharaCollectionModel.countDocuments({ playerId: player._id });
            const maxPageNumber = Math.ceil(totalDocuments / PAGE_SIZE);
            if (isNaN(pageInput)) {
                return (0, exceptions_1.pageNF)(interaction, maxPageNumber, { 'command': 'collection', 'data': 'character' }, 'nan');
            }
            else if (pageInput % 1 != 0) {
                return (0, exceptions_1.pageNF)(interaction, maxPageNumber, { 'command': 'collection', 'data': 'character' }, 'decimal');
            }
            else if (pageInput > maxPageNumber || pageInput < 1) {
                return (0, exceptions_1.pageNF)(interaction, maxPageNumber, { 'command': 'collection', 'data': 'character' });
            }
            await collection_1.default.callback(client, interaction, true, pageInput);
        }
        catch (error) {
            console.log(`Handle Submit Modal searchCollectionPageModal Error: ${error}`);
        }
    }
};
