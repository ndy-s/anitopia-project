import { Client, ModalSubmitInteraction } from "discord.js";

export default {
    name: "infoCharaModal",

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const charaIdInput: number = Number(interaction.fields.getTextInputValue('charaIdInput'));

            console.log(charaIdInput);
        } catch (error) {

        }
    }
}