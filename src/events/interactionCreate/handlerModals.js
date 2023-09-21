const getLocalModalHandler = require("../../utils/getLocalModalHandler");

module.exports = async (client, interaction) => {
    if (!interaction.isModalSubmit()) return;

    try {
        const localModalHandler = getLocalModalHandler();
        const modalHandlerObject = localModalHandler.find(
            (mdl) => mdl.name === interaction.customId
        );

        await modalHandlerObject.callback(client, interaction);
    } catch (error) {
        console.log(`There was an error running this modal submit handler: ${error}`);
    }
}
