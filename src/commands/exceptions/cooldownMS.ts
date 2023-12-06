import { CommandInteraction, EmbedBuilder } from "discord.js";

import { config } from "../../config";
import { CooldownModel } from "../../models";
import { ICommandObject } from "../../interfaces";

export const cooldownMS = async (interaction: CommandInteraction, commandObject: ICommandObject) => {
    const commandName = interaction.commandName;
    const userId = interaction.user.id;

    let cooldown = await CooldownModel.findOne({
        userId, commandName
    });

    if (cooldown && Date.now() < cooldown.endsAt.getTime()) {
        const { default: prettyMs } = await import('pretty-ms');

        const timeLeft = prettyMs(cooldown.endsAt.getTime() - Date.now());

        const cooldownEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⏱️ Command Cooldown')
            .setDescription(`You are currently on cooldown. Please wait **${timeLeft}** ⏳ before using this command again.`)
            .setFooter({
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