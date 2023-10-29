"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cooldownMS = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const models_1 = require("../../models");
const cooldownMS = async (interaction, commandObject) => {
    const commandName = interaction.commandName;
    const userId = interaction.user.id;
    let cooldown = await models_1.CooldownModel.findOne({
        userId, commandName
    });
    if (cooldown && Date.now() < cooldown.endsAt.getTime()) {
        const { default: prettyMs } = await Promise.resolve().then(() => require('pretty-ms'));
        const timeLeft = prettyMs(cooldown.endsAt.getTime() - Date.now());
        const cooldownEmbed = new discord_js_1.EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⏱️ Command Cooldown')
            .setDescription(`You are currently on cooldown. Please wait **${timeLeft}** ⏳ before using this command again.`)
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: config_1.config.messages.footerText
        });
        await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        return false;
    }
    if (!cooldown) {
        cooldown = new models_1.CooldownModel({ userId, commandName });
    }
    cooldown.endsAt = new Date(Date.now() + commandObject.cooldown);
    await cooldown.save();
    return true;
};
exports.cooldownMS = cooldownMS;
