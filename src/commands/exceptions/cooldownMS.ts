import { CommandInteraction, EmbedBuilder } from "discord.js";
import CooldownModel from '../../models/Cooldown';
import { CommandObject } from "../../interfaces";
import { config } from "../../config";

export default async (interaction: CommandInteraction, commandObject: CommandObject) => {
    const commandName = interaction.commandName;
    const userId = interaction.user.id;

    let cooldown = await CooldownModel.findOne({
        userId, commandName
    });

    if (cooldown && Date.now() < cooldown.endsAt.getTime()) {
        const { default: prettyMs } = await import('pretty-ms');

        const timeLeft = prettyMs(cooldown.endsAt.getTime() - Date.now());

        const cooldownEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Command Cooldown')
            .setDescription(`You are currently on cooldown. Please wait **${timeLeft}** ⏳ before using this command again.`)
            .setFooter({
                iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 512}),
                text: config.messages.footerText
            });
    
        await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });

        return false;
    }

    if (!cooldown) {
        cooldown = new CooldownModel({ userId, commandName });
    }

    cooldown.endsAt = new Date(Date.now() + commandObject.cooldown);
    await cooldown.save();
    return true;
};