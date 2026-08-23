import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import * as path from "path";

import profile from "../account/profile";
import character from "../character/character";
import summon from "./summon";
import { runBattleForPlayer } from "./battle";
import { actionNA, handleCollectorTimeout } from "../exceptions";

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
                    .setLabel('Duel')
                    .setDescription('Challenge another player to a team battle')
                    .setValue('duel')
                    .setEmoji('⚔️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Battle')
                    .setDescription('Battle a random AI-controlled team to test your squad')
                    .setValue('battle')
                    .setEmoji('🤖'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Profile')
                    .setDescription('Manage game progress, profile, and more')
                    .setValue('profile')
                    .setEmoji('👤'),
            );

        const iconAttachment = new AttachmentBuilder(
            path.join(__dirname, '..', '..', 'public', 'anitopia_icon.png'),
            { name: 'anitopia_icon.png' }
        );

        const mainEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Anitopia Main Commands')
            .setThumbnail('attachment://anitopia_icon.png')
            .setDescription(`Hello, ${interaction.user.username}! Are you ready to explore Anitopia? Use the dropdown menu below to navigate through the game.`)
            .setFooter({
                text: 'Select an option from the menu bellow to get started.'
            });

        const mainComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mainOption);

        const responseOptions = {
            embeds: [mainEmbed],
            components: [mainComponentRow],
            files: [iconAttachment]
        };

        const response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        
        const collectorFilter = (i: {
            reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
            user: { id: string; username: string; };
        }) => {
            if (i.user.id !== interaction.user.id) {
                actionNA(i, interaction.user.username);
                return false;
            }

            return true;
        };

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
                } else if (confirmation.values.includes('duel')) {
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blurple')
                                .setTitle('⚔️ Duel')
                                .setDescription(`Ready to challenge someone? Run ${'`/duel @user`'} directly and mention the player you want to duel.`)
                        ]
                    });
                } else if (confirmation.values.includes('battle')) {
                    const battlePromptEmbed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setTitle('🤖 Battle')
                        .setDescription('Test your squad against a random AI-controlled team. Click below to start!');

                    const startBattleButton = new ButtonBuilder()
                        .setCustomId('startBattle')
                        .setLabel('Start Battle')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('⚔️');

                    const battlePrompt = await interaction.followUp({
                        embeds: [battlePromptEmbed],
                        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(startBattleButton)],
                    });

                    try {
                        const battleConfirmation = await battlePrompt.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300_000,
                        });

                        if (battleConfirmation.customId === 'startBattle') {
                            await battleConfirmation.deferUpdate();
                            await runBattleForPlayer(
                                interaction,
                                // editReply only patches the fields it's given — the "Start Battle" button
                                // would otherwise survive every turn edit since we never re-pass components.
                                (options) => battleConfirmation.editReply({ ...options, components: [] }),
                                battleConfirmation
                            );
                        }
                    } catch (error) {
                        await handleCollectorTimeout(
                            error,
                            { editReply: (options) => battlePrompt.edit(options) },
                            battlePromptEmbed,
                            '/main',
                            'Main Battle Prompt'
                        );
                    }
                } else if (confirmation.values.includes('story')) {
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blurple')
                                .setTitle('🏰 Story')
                                .setDescription(`Story mode isn't built yet — anime-based chapters and quests are on the roadmap. Check back in a future update!`)
                        ]
                    });
                }
            } 
        } catch (error) {
            await handleCollectorTimeout(error, interaction, mainEmbed, '/main', 'Main Command');
        }
    }
};