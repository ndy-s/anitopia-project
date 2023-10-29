import { ActionRowBuilder, Client, CommandInteraction, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import redis from "../../lib/redis";

import { configProfileEmbed } from "../../config";
import { getPlayer } from "../../utils";
import { PlayerModel } from "../../models";

export default {
    name: 'profile',
    description: 'Shows your Anitopia profile',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        let player = await getPlayer(interaction);

        const profileOption = new StringSelectMenuBuilder()
            .setCustomId('profileOption')
            .setPlaceholder('Select an action for your profile')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Customize Profile`)
                    .setDescription('Personalize your profile to make it uniquely yours')
                    .setValue('customize')
                    .setEmoji('🎨'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Daily Rewards')
                    .setDescription('Earn exciting rewards every day')
                    .setValue('daily')
                    .setEmoji('🎁'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Redeem Code')
                    .setDescription('Got a code? Redeem it for cool perks')
                    .setValue('redeem')
                    .setEmoji('🔑'),
            );

        const profileEmbed = configProfileEmbed(interaction, player);

        const profileComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(profileOption);

        const responseOptions = {
            embeds: [profileEmbed],
            components: [profileComponentRow],
        };

        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            while (true) {
                let confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });


                // profileOption.options.forEach(option => {
                //     if ('values' in confirmation) {
                //         if (confirmation.values.includes(option.data.value)) {
                //             option.setDefault(true);
                //         }
                //     }
                // });

                if (confirmation.customId === 'profileOption' && 'values' in confirmation) {
                    if (confirmation.values.includes('customize')) {
                        player = await PlayerModel.findOne({
                            userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                        });
            
                        if (player) {
                            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                        
                            const customizeProfileModal = new ModalBuilder()
                                .setCustomId('customizeProfileModal')
                                .setTitle('Customize Profile');
    
                            const bioInput = new TextInputBuilder()
                                .setCustomId('bioInput')
                                .setLabel("Biography")
                                .setStyle(TextInputStyle.Paragraph)
                                .setValue(player.bio)
                                .setMaxLength(100)
                                .setRequired(true);
    
                            customizeProfileModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(bioInput));
                            await confirmation.showModal(customizeProfileModal);
    
                            const components = [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(profileOption)];
                            response = await (followUp ? response.edit({ components }) : interaction.editReply({ components }));
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                profileEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /profile.`
                });
                await interaction.editReply({
                    embeds: [profileEmbed],
                    components: []
                });
            } else {
                console.log(`Profile Command Error: ${error}`);
            }
        }

    }
};