import { ActionRowBuilder, ActionRowData, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, MessageComponentInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { getPlayer } from "../../utils";
import { CharaCollectionModel } from "../../models";

import collection from "./collection";
import team from "./team";

export default {
    name: 'character',
    description: 'See and improve your characters, and form your team.',
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
                    .setDescription('Take a look at your character collection')
                    .setValue('collection')
                    .setEmoji('🖼️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Enhance')
                    .setDescription('Level up your characters for better performance')
                    .setValue('enhance')
                    .setEmoji('⚡'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Team')
                    .setDescription('Create a powerful team with your characters')
                    .setValue('team')
                    .setEmoji('🛡️'),
            );

        const characterEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Character')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to your character command center! Here, you can view your collection of characters, enhance their abilities, or form a powerful team. Choose an option from the menu to get started. If you need any help, don't hesitate to ask!`);

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