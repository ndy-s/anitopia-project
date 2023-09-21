const { Client, Interaction } = require('discord.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: (client, interaction) => {
        interaction.reply({
            content: "Here is read!",
            ephemeral: true
        })
    },
    name: "customizeProfileModal"
}