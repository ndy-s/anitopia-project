import { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { CharaCollectionModel } from "../../models";


export default {
    name: 'info',
    description: 'Check your character details',
    cooldown: 5_000,
    options: [
        {
            name: 'character-id',
            description: "Enter your Character ID of the character you'd like to view",
            type: ApplicationCommandOptionType.String,
            min_length: 4,
            required: true,
        }
    ],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const characterIdOptionValue = interaction.options.get('character-id')?.value; 

        const characterInfo = await CharaCollectionModel.find({ characterId: characterIdOptionValue }).populate('character');

        const characterInfoEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(``)

        await interaction.reply({
            content: characterInfo.toString(),
        })

    }
}