const getLocalModalHandler = require("../../utils/getLocalModalHandler");

module.exports = async (client, interaction) => {
    if (!interaction.isModalSubmit()) return;

    const localModalHandler = getLocalModalHandler();
    const modalHandlerObject = localModalHandler.find(
        (mdl) => mdl.name === interaction.customId
    );

    await modalHandlerObject.callback(client, interaction);

}
