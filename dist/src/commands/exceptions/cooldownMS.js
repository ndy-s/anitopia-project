"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Cooldown_1 = require("../../models/Cooldown");
const config_1 = require("../../config");
exports.default = async (interaction, commandObject) => {
    const commandName = interaction.commandName;
    const userId = interaction.user.id;
    let cooldown = await Cooldown_1.default.findOne({
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
            text: config_1.config.messages.footerText
        });
        await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        return false;
    }
    if (!cooldown) {
        cooldown = new Cooldown_1.default({ userId, commandName });
    }
    cooldown.endsAt = new Date(Date.now() + commandObject.cooldown);
    await cooldown.save();
    return true;
};
