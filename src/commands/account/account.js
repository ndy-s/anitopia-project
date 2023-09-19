const { Client, Interaction, EmbedBuilder} = require('discord.js');

const Account = require('../../models/Account');
// Import exceptions
const commandNotAllowed = require('../../exceptions/commandNotAllowed.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    callback: async (client, interaction) => {
        let account = await Account.findOne({
            accountId: interaction.member.id,
            guildId: interaction.guild.id
        })

        console.log(interaction.command.id);
    },

    name: 'account',
    description: 'TBA soon!',
};