const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');
const exceptionCommand = require('../../exception/command');
const exceptionUserNF = require('../../exception/userNF');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'You can only run this command inside a server.',
                ephemeral: true,
            })
            return;
        }

        let user = await User.findOne({ userId: interaction.member.id, guildId: interaction.guild.id });
        const mentionedUserId = interaction.options.get('user')?.value || interaction.member.id;
        const mentionedUsername = interaction.options.get('user')?.user
            ? interaction.options.get('user')?.user.username +'#'+ interaction.options.get('user')?.user.discriminator 
            : interaction.user.username +'#'+ interaction.user.discriminator;
        let targetUser = await User.findOne({ userId: mentionedUserId, guildId: interaction.guild.id });

        if (user) {
            if (targetUser) {
                const emojiId = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "AniCoin").id;
                interaction.reply({ embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setTitle(`Anitopia Offical Denizen Card`)
                        .setDescription(`**${mentionedUsername}**\nAnitopian status hasn't been set yet.`)
                        .addFields(
                            { name: 'ADVENTURE', value: `**Level**: ${targetUser.level}\n**Exp**: ${targetUser.exp}\n**Arena**: \n**Stamina**: ` },
                        )
                        .addFields(
                            { name: 'OTHERS', value: `VALUES`, inline: true },
                            { name: 'COINS', value: `🪙 **Coin**: ${targetUser.coin}\n<:AniCoin:${emojiId}> **AniCoin**: ${targetUser.aniCoin}`, inline: true },
                        )
                        .setFooter({ text: 'For assistance, type /help for more info.' })
                ]});
            } else {
                exceptionUserNF(interaction, mentionedUsername);
                return;
            }
        } else {
            exceptionCommand(interaction);
            return;
        }
    },
    name: 'profile',
    description: 'View your character profile and explore your accomplishments in the realm of Anitopia',
    options: [
        {
            name: 'user',
            description: 'The Anitopian whose profile you want to view.',
            type: ApplicationCommandOptionType.User,
        }
    ]
};