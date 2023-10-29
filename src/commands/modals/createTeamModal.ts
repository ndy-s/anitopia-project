import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

export default {
    name: "createTeamModal",
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const createTeamInput = interaction.fields.getTextInputValue('createTeamInput');

            const chooseTeamTypeEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    name: `${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`Choose Type for Your Team`);

            await interaction.deferUpdate();
            await interaction.editReply({
                content: createTeamInput,
                embeds: [chooseTeamTypeEmbed],
                components: []
            });

        } catch (error) {
            console.log(`Handle Submit Modal createTeamModal Error: ${error}`);
        }
    }
}