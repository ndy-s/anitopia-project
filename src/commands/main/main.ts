import { ActionRowBuilder, Client, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import profile from "../account/profile";
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
            .setPlaceholder('What would you like to do next?')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Story')
                    .setDescription('Explore anime-based chapters and quests')
                    .setValue('story')
                    .setEmoji('🏰'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Profile')
                    .setDescription('Manage game progress, profile, and more')
                    .setValue('profile')
                    .setEmoji('👤'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Summon')
                    .setDescription('Summon your charassss')
                    .setValue('summon')
                    .setEmoji('🔮')
            );

        const mainEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Anitopia Main Commands')
            .setThumbnail('https://europe1.discourse-cdn.com/unity/original/3X/6/0/608e0f8940360c004564efc302d52054b7bc2493.jpeg')
            .setDescription(`Hello, ${interaction.user.username}! Ready for Anitopia?`)
            .setFooter({
                text: 'Use the dropdown menu to select an option. Need help? Type "/help" in the chat.'
            });

        const responseOptions: any = {
            embeds: [mainEmbed],
            components: [new ActionRowBuilder().addComponents(mainOption)]
        };

        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            let mainConfirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (mainConfirmation.customId === 'mainOption' && 'values' in mainConfirmation) {
                await mainConfirmation.deferUpdate();
                await mainConfirmation.editReply({
                    components: []
                });

                if (mainConfirmation.values.includes('profile')) {
                    await profile.callback(client, interaction, true);
                } else if (mainConfirmation.values.includes('summon')) {
                    await summon.callback(client, interaction, true);
                }
            } 
        } catch (error) {
            console.log(`Main Command Error: ${error}`);
        }
    }
};