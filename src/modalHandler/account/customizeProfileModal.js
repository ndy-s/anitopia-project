const { Client, Interaction, EmbedBuilder } = require('discord.js');

const { footerText } = require('../../../config.json');
const Account = require('../../models/Account');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        const bioInput = interaction.fields.getTextInputValue('bioInput');
        const usernameInput = interaction.fields.getTextInputValue('usernameInput');

        try {
            let account = await Account.findOne({
                accountId: interaction.member.id,
                guildId: interaction.guild.id
            });

            account.bio = bioInput;
            account.username = usernameInput;
            await account.save();

            const embed= new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({
                    name: interaction.user.globalName,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`${account.username}'s Account`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**Biography**\n\`\`\` ${account.bio} \`\`\`\nExplore more options by selecting from the choices below. To personalize your profile, simply click on **Customize Profile** in the menu.`)
                .addFields(
                    {
                        name: '⭐ Level',
                        value: `${account.level}`,
                        inline: true
                    },
                    {
                        name: `Experience Points`,
                        value: `${account.exp}/10000`,
                        inline: true
                    },
                    {
                        name: 'Account Code',
                        value: `\`${account.code}\``,
                        inline: true
                    },
                    {
                        name: 'Gold Pieces',
                        value: `${account.goldPieces}`,
                        inline: true
                    },
                    {
                        name: 'Starlight Gems',
                        value: `${account.starlightGems}`,
                        inline: true
                    },
                )
                .setFooter({
                    text: footerText
                });

            await interaction.deferUpdate();
            await interaction.editReply({
                embeds: [embed],
            });

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor('DarkRed')
                        .setAuthor({
                            name: interaction.user.globalName,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle('Acccount Updated Successfully')
                        .setDescription(`Congratulations! Your account **Username** and **Biography** has been successfully updated.\n\nDive back into the world of Anitopia and continue your adventure with renewed vitality!`)
                        .setFooter({
                            text: footerText
                        })
                ],
                ephemeral: true
            })
        } catch (error) {
            console.log(`customizeProfileModal Error: ${error}`);
        }

    },
    name: "customizeProfileModal"
}