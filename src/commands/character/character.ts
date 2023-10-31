import { ActionRowBuilder, ActionRowData, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, MessageComponentInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { getPlayer } from "../../utils";
import { CharaCollectionModel } from "../../models";

import collection from "./collection";
import team from "./team";
import { config } from "../../config";

export default {
    name: 'character',
    description: 'Manage characters and teams in one place',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction | CollectedInteraction, followUp: boolean = false, back: boolean = false) => {
        let player = await getPlayer(interaction);

        const characterOption = new StringSelectMenuBuilder()
            .setCustomId('characterOption')
            .setPlaceholder('Select an action for your character')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Collection`)
                    .setDescription('Browse through your collection of characters')
                    .setValue('collection')
                    .setEmoji('🖼️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Enhance')
                    .setDescription('Level up your characters to make them stronger')
                    .setValue('enhance')
                    .setEmoji('⚡'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Team')
                    .setDescription('Build and manage teams for battles')
                    .setValue('team')
                    .setEmoji('🛡️'),
            );

        const characterEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Character Command Center')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Character Command Center! Here, you can manage all aspects of your characters.\n\n- **Collection**: Browse and learn more about your characters.\n- **Enhance**: Power up your characters to increase their abilities.\n- **Team**: Strategically form teams with your characters for battles.`)
            .setFooter({
                iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                text: 'Select an option from the menu bellow for your character.',
            });

        const characterComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(characterOption);

        const responseOptions = {
            embeds: [characterEmbed],
            components: [characterComponentRow],
            files: []
        };
        
        let response;
        if (back) {
            await (interaction as MessageComponentInteraction).deferUpdate();
            response = await interaction.editReply(responseOptions);
        } else {
            response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'characterOption' && 'values' in confirmation) {
                if (confirmation.values.includes('collection')) {
                    await collection.callback(client, confirmation, true);
                } else if (confirmation.values.includes('team')) {
                    await team.callback(client, confirmation, true);
                }
            }

        } catch (error) {
            console.log(error);
        }
    },
};