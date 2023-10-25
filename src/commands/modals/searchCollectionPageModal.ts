import { Client, ModalSubmitInteraction } from "discord.js";

export default {
    name: "searchCollectionPageModal",

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const pageInput = interaction.fields.getTextInputValue('pageInput');
            console.log(pageInput);

            await interaction.deferUpdate();

        } catch (error) {
            console.log(`Handle Submit Modal searchCollectionPageModal Error: ${error}`);
        }
    }
}