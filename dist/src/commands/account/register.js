"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Account_1 = require("../../models/Account");
const registrationNA_1 = require("../exceptions/registrationNA");
const generateUniqueToken_1 = require("../../utils/generateUniqueToken");
exports.default = {
    name: 'register',
    description: 'Join Anitopia and start your adventure',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction, account) => {
        if (account) {
            (0, registrationNA_1.default)(interaction);
            return;
        }
        const latestAccount = await Account_1.default.findOne({}, {}, { sort: { createdAt: -1 } });
        const generatedUniqueToken = (0, generateUniqueToken_1.default)(latestAccount?.token ?? null);
        account = new Account_1.default({
            ...{
                accountId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                guildId: interaction.guild?.id,
                username: interaction.user.username,
                token: generatedUniqueToken,
            }
        });
        // await account.save();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('The Gate Keeper of Anitopia')
            .setThumbnail('https://i.pinimg.com/564x/64/69/7b/64697be0705dd503415616a26162204b.jpg')
            .setDescription(`Welcome, <@!${interaction.user.id}>!\n\nAs the Gate Keeper of Anitopia, I invite you to a realm of extraordinary experiences. By clicking '**Create Account**', you're not just signing up, but setting sail on an exciting journey.\n\nMay your adventure be filled with joy and discovery!`)
            .setFooter({
            iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: 'Start by clicking the Create Account button'
        });
        const response = await interaction.reply({
            embeds: [embed],
        });
    },
};
