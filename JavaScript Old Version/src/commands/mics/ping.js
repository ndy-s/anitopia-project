module.exports = {
    name: 'ping',
    description: 'Pong!',

    devOnly: false,
    testOnly: false,
    deleted: false,

    // options: ,
    callback: (client, interaction) => {
        interaction.reply(`Pong! ${client.ws.ping} ms`);
    },
};