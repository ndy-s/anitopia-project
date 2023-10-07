import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export default (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setTitle('Registration Not Allowed')
                .setDescription("You've **already registered** and cannot register again. Please **type** </explore:1153593389091143690> to begin your journey.")
                .setFooter({
                    text: config.messages.footerText
                })
        ],
        ephemeral: true,
    });
};