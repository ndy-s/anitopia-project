import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import redis from "../../lib/redis";

import { config } from "../../config";
import { getPlayer, generateUniqueID } from "../../utils";
import { registrationNA } from "../exceptions";
import { PlayerModel } from "../../models";

import profile from "./profile";
import main from "../main/main";

export default {
    name: 'register',
    description: 'Join Anitopia and start your adventure',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction) => {
        let player = await getPlayer(interaction);
        
        if (player) {
            registrationNA(interaction);
            return;
        }

        const latestAccount = await PlayerModel.findOne({}, {}, { sort: { createdAt: -1 } });
        const generatedUniqueToken = generateUniqueID(latestAccount?.playerId ?? null);

        player = new PlayerModel({
            ...{
                userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                guildId: interaction.guild?.id,
                playerId: generatedUniqueToken,
            }
        });

        const registerEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Welcome to Anitopia!')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Explosion! Ahem... Greetings, <@!${interaction.user.id}>!\n\nI am Megumin, the great Arch-Wizard of Anitopia. I invite you to a realm of extraordinary experiences. By clicking '**Create Account**', you're not just signing up, but setting sail on an exciting journey.\n\nMay your adventure be filled with joy and discovery!`);

        const registerComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('createAccount')
                    .setLabel('Create Account')
                    .setStyle(ButtonStyle.Success)
            );

        const response = await interaction.reply({
            embeds: [registerEmbed],
            components: [registerComponentRow],
        });

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });
    
            if (confirmation.customId === 'createAccount') {
                await confirmation.deferUpdate();
                await player.save();
                await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

                const mainButton = new ButtonBuilder()
                    .setCustomId('main')
                    .setLabel('Main')
                    .setStyle(ButtonStyle.Primary);

                const profileButton = new ButtonBuilder()
                    .setCustomId('profile')
                    .setLabel('Profile')
                    .setStyle(ButtonStyle.Primary);

                const commandButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    mainButton,
                    profileButton
                );
    
                const congratulationResponse = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTitle(`Congratulations ${interaction.user.username}!`)
                            .setDescription(`🎉 Congratulations <@!${interaction.user.id}>! Your account has been successfully set up. Your epic journey in the world of Anitopia is about to unfold. Use ${config.commands.profileCommandTag} to check out your profile, and kickstart your adventure with ${config.commands.mainCommandTag}. Have a fantastic journey!`)
                            .setFooter({
                                text: config.messages.footerText
                            })
                    ],
                    components: [commandButtonRow]
                });

                try {
                    const confirmation = await congratulationResponse.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });

                    await confirmation.deferUpdate();
                    await interaction.editReply({
                        components: []
                    });

                    if (confirmation.customId === 'main') {
                        await main.callback(client, interaction, true);
                    } else if (confirmation.customId === 'profile') {
                        await profile.callback(client, interaction, true);
                    }

                } catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        await interaction.editReply({
                            components: []
                        });
                    } else {
                        console.log(`Congratulations Success Handler Error: ${error}`)
                    }
                }

            }
        } catch (error) {            
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                registerEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /register.`
                });
                await interaction.editReply({
                    embeds: [registerEmbed],
                    components: []
                });
            } else {
                console.log(`Register Command Error: ${error}`);
            }
        }

    },
};