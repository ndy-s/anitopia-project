import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import team from "../character/team";
import { config } from "../../config";
import { getPlayer } from "../../utils";
import { PlayerModel } from "../../models";
import redis from "../../lib/redis";
import detailTeamModal from "./detailTeamModal";

export default {
    name: "createTeamModal",
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const createTeamInput = interaction.fields.getTextInputValue('createTeamInput').toUpperCase();
            const hasSymbols = /[^A-Za-z0-9 ]/.test(createTeamInput);

            if (hasSymbols) {
                const symbolErrorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Invalid Team Name')
                    .setDescription(`It looks like the team name **${createTeamInput}** has some special characters. For team names, please stick to letters and numbers. Let's give it another shot!`)
                    .setFooter({
                        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                        text: config.messages.footerText
                    });
            
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [symbolErrorEmbed],
                    ephemeral: true
                });

                return;
            }

            function updateDescription(timeLeft: number) {
                return `Hey there! You're on your way to creating a team called **${createTeamInput}**.\n\nAwesome! Now, would you like a **Team of 3** for tasks like floor levels and story missions? Or do you prefer a **Team of 5** for grand battles in event dungeons and raids?\n\nMake your choice! But remember, you've got \`⏳${timeLeft} second${timeLeft > 1 ? 's' : ''}\` before this process times out. If time runs out without a response, we'll have to cancel the process.`;
            }

            let timeLeft = 300;
            const chooseTeamSizeEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    name: `${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`Select Your Team Size`)
                .setDescription(updateDescription(timeLeft))
                .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                    text: 'Click the cancel button to abort this process.'
                });

            const cancelEmbed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: `${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`⛔ Team Creation Cancelled`)
                .setDescription(`The team creation process has been **cancelled**. But hey, there's always another time! Whenever you're ready to start the process again, we're here to assist you.`)
                .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                    text: config.messages.footerText,
                });

            const successEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    name: `${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`🎊 Team Successfully Created`)
                .setDescription(`Congratulations! 🎉 Your new team **${createTeamInput}** has been successfully created. Now, let's get your team ready for battle!\n\nTo set up your team, you'll need to assign a unique character to each position. Each character is identified by a unique **Character ID**.\n\nOnce your lineup is set, you're all set to select this team for battles.`)
                .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                    text: config.messages.footerText,
                });

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⛔');
            
            const teamOf3Button = new ButtonBuilder()
                .setCustomId('teamof3')
                .setLabel('Team of 3')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👪');
                
            const teamOf5Button = new ButtonBuilder()
                .setCustomId('teamof5')
                .setLabel('Team of 5')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👨‍👩‍👧‍👦');


            const chooseTeamSizeComponentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                cancelButton,
                teamOf3Button,
                teamOf5Button
            )

            await interaction.deferUpdate();
            const response = await interaction.editReply({
                embeds: [chooseTeamSizeEmbed],
                components: [chooseTeamSizeComponentRow]
            });

            const intervalId = setInterval(async () => {
                timeLeft--;
                chooseTeamSizeEmbed.setDescription(updateDescription(timeLeft));
                
                await interaction.editReply({
                    embeds: [chooseTeamSizeEmbed],
                });
            
                if (timeLeft === 0) {
                    clearInterval(intervalId);
                    setTimeout(async () => {
                        await interaction.followUp({
                            embeds: [cancelEmbed],
                            ephemeral: true
                        });
                    }, 400);
                    await team.callback(client, interaction, true, true)
                }
            }, 1000);
            

            const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });

                if (confirmation.customId === 'cancel') {
                    clearInterval(intervalId);
                    setTimeout(async () => {
                        await interaction.followUp({
                            embeds: [cancelEmbed],
                            ephemeral: true
                        });
                    }, 400);
                    await team.callback(client, confirmation, true)
                } else if (confirmation.customId === 'teamof3') {
                    clearInterval(intervalId);
                    const newTeam = {
                        name: createTeamInput,
                        size: 3,
                        lineup: [
                            { position: 'frontMiddle' },
                            { position: 'backLeft' },
                            { position: 'backRight' }
                        ]
                    };

                    const player = await PlayerModel.findOneAndUpdate(
                        { userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined },
                        { $push: { teams: newTeam } },
                        { new: true }
                    );

                    await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

                    await confirmation.deferUpdate();    
                    await confirmation.followUp({
                        embeds: [successEmbed],
                        ephemeral: true
                    });
                    return await detailTeamModal.callback(client, confirmation, createTeamInput, false);
                }
                
            } catch (error) {
                console.log(error);
            }

        } catch (error) {
            console.log(`Handle Submit Modal createTeamModal Error: ${error}`);
        }
    }
}