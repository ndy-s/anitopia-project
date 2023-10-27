import { Client, ModalSubmitInteraction } from "discord.js";
import collection from "../character/collection";
import { CharaCollectionModel } from "../../models";
import { pageNF } from "../exceptions";
import { getPlayer } from "../../utils";

export default {
    name: "searchCollectionPageModal",

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const pageInput: number = Number(interaction.fields.getTextInputValue('pageInput'));
            const player = await getPlayer(interaction);

            const PAGE_SIZE: number = 12;
            const totalDocuments: number = await CharaCollectionModel.countDocuments({ playerId: player._id });
            const maxPageNumber: number = Math.ceil(totalDocuments / PAGE_SIZE);
    
            if (isNaN(pageInput)) {
                return pageNF(interaction, maxPageNumber, {'command': 'collection', 'data': 'character'}, 'nan');
            } else if (pageInput % 1 != 0) {
                return pageNF(interaction, maxPageNumber, {'command': 'collection', 'data': 'character'}, 'decimal');
            } else if (pageInput > maxPageNumber || pageInput < 1) {
                return pageNF(interaction, maxPageNumber, {'command': 'collection', 'data': 'character'});
            }

            await collection.callback(client, interaction, true, pageInput, true);

        } catch (error) {
            console.log(`Handle Submit Modal searchCollectionPageModal Error: ${error}`);
        }
    }
}