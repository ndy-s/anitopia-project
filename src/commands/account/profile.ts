import { ActionRowBuilder, Client, CommandInteraction, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import redis from "../../lib/redis";
import PlayerModel from "../../models/Player";
import { config , configProfileEmbed } from "../../config";

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
        const result = await redis.get(interaction.user.id);
        let player;

        if (result) {
            player = JSON.parse(result);
        } else {
            player = await PlayerModel.findOne({
                userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
            });

            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
        }

        const profileOption = new StringSelectMenuBuilder()
            .setCustomId('profileOption')
            .setPlaceholder('Choose your profile action!')
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

        const profileComponentRow: any = new ActionRowBuilder().addComponents(profileOption);

        const responseOptions = {
            embeds: [profileEmbed],
            components: [profileComponentRow],
        };

        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            while (true) {
                let profileConfirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });


                // profileOption.options.forEach(option => {
                //     if ('values' in profileConfirmation) {
                //         if (profileConfirmation.values.includes(option.data.value)) {
                //             option.setDefault(true);
                //         }
                //     }
                // });

                if (profileConfirmation.customId === 'profileOption' && 'values' in profileConfirmation) {
                    if (profileConfirmation.values.includes('customize')) {
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
    
                            const customizeProfileModalRow: any = new ActionRowBuilder().addComponents(bioInput);
                            customizeProfileModal.addComponents(customizeProfileModalRow);
                            await profileConfirmation.showModal(customizeProfileModal);
    
                            const components: any = [new ActionRowBuilder().addComponents(profileOption)];
                            response = await (followUp ? response.edit({ components }) : interaction.editReply({ components }));
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "Collector received no interactions before ending with reason: time") {
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

    }
};