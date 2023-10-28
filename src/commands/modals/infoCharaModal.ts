import { Client, ModalSubmitInteraction } from "discord.js";
import info from "../character/info";

export default {
    name: "infoCharaModal",

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const charaIdInput = interaction.fields.getTextInputValue('charaIdInput').toUpperCase();

            await info.callback(client, interaction, charaIdInput);
        } catch (error) {
            console.log(`Handle Submit Modal infoCharaModal Error: ${error}`);
        }
    }
}