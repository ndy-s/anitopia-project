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
                const emojiId = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "anicoin").id;
                interaction.reply({ embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(`${mentionedUsername}'s Coins`)
                        .setDescription(`🪙 ${targetUser.coin} Coin${targetUser.coin !== 0 ? 's' : ''}\n<:anicoin:${emojiId}> ${targetUser.aniCoin} AniCoin${targetUser.aniCoin !== 0 ? 's' : ''}`)
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
    name: 'coin',
    description: 'Check your coin balance and wealth in the realm of Anitopia',
    options: [
        {
            name: 'user',
            description: 'The Anitopian for whom you want to retrieve the coins.',
            type: ApplicationCommandOptionType.User,
        }
    ]
}