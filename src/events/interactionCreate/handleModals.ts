import { Client, ModalSubmitInteraction } from "discord.js";
import getLocalModals from "../../utils/getLocalModals";


export default async (client: Client, interaction: ModalSubmitInteraction) => {
    if (!interaction.isModalSubmit()) return;

    try {
        const localModalHandler = getLocalModals();

        const modalHandlerObject = localModalHandler.find(
            (mdl) => mdl.name === interaction.customId
        );

        await modalHandlerObject.callback(client, interaction);
    } catch (error) {
        console.log(`There was an error running this modal submit handler: ${error}`);
    }
};