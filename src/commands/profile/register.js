const { Client, Interaction, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

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

        await interaction.deferReply();
        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
        };
        let user = await User.findOne(query);

        if (user) {
            interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle("Registration Exception❗")
                    .setDescription(`Oops, Anitopian **${interaction.user.username}#${interaction.user.discriminator}**! It seems that you are already a registered denizen of Anitopia.`)
                    .setFooter({ text: 'For assistance, type /help for more info.' })
            ]});

            return;
        } else {
            user = new User({
                ...query,
            });
        }

        await user.save();

        const embed = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle("Megumin")
            .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
            // Thumbnail picture need to change!
            .setThumbnail('https://external-preview.redd.it/V3p4mn2Sc2YgEQWOdNkE0VYVxK_-Wxe0KNJT1L-Bn-E.jpg?auto=webp&s=78d36cc9d0dec740fc7b1ab5e825faccd4fa28f7')
            .setDescription(`
                Explosion! Ahem... Greetings, my esteemed **Anitopian** <@!${interaction.user.id}>! I am Megumin, the great arch-wizard of Anitopia, and I extend a warm welcome to our extraordinary realm. You have been granted access to the sacred land where you will embark on an unforgettable journey filled with adventure and boundless mysteries.
            `);

        interaction.editReply({ embeds: [embed] });
    },
    name: 'register',
    description: "Register your official citizenship.",
    // deleted: true,
}