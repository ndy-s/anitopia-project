import { ActionRowBuilder, Client, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import profile from "../account/profile";
import character from "../character/character";
import summon from "./summon";

export default {
    name: 'main',
    description: 'Central hub for Anitopia commands',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        const mainOption = new StringSelectMenuBuilder()
            .setCustomId('mainOption')
            .setPlaceholder('Select a command from the list')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Story')
                    .setDescription('Explore anime-based chapters and quests')
                    .setValue('story')
                    .setEmoji('🏰'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Summon')
                    .setDescription('Summon your favorite characters')
                    .setValue('summon')
                    .setEmoji('🔮'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Character')
                    .setDescription('Manage and upgrade your team of characters.')
                    .setValue('character')
                    .setEmoji('🧙'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Profile')
                    .setDescription('Manage game progress, profile, and more')
                    .setValue('profile')
                    .setEmoji('👤'),
            );

        const mainEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Anitopia Main Commands')
            .setThumbnail('https://europe1.discourse-cdn.com/unity/original/3X/6/0/608e0f8940360c004564efc302d52054b7bc2493.jpeg')
            .setDescription(`Hello, ${interaction.user.username}! Are you ready to explore Anitopia? Use the dropdown menu below to navigate through the game.`)
            .setFooter({
                text: 'Select an option from the dropdown menu to continue.'
            });

        const mainComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainOption);

        const responseOptions = {
            embeds: [mainEmbed],
            components: [mainComponentRow]
        };

        const response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'mainOption' && 'values' in confirmation) {
                await confirmation.deferUpdate();
                await confirmation.editReply({
                    components: []
                });

                if (confirmation.values.includes('profile')) {
                    await profile.callback(client, interaction, true);
                } else if (confirmation.values.includes('summon')) {
                    await summon.callback(client, interaction, true);
                } else if (confirmation.values.includes('character')) {
                    await character.callback(client, interaction, true);
                }
            } 
        } catch (error) {
            console.log(`Main Command Error: ${error}`);
        }
    }
};