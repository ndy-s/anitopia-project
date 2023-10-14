import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import CharacterModel from "../../models/Character";

export default {
    name: 'summon',
    description: 'Bring your favorite characters into the game',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        const summonEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Summoning Altar')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Anitopia Summoning Altar! This is where you can expand your collection of characters. Each type of scroll summons characters of different rarities:\n\n- **Basic Scroll**: These scrolls can summon characters of ★1 to ★4 rarity. The chances are **50% for ★1**, **29% for ★2**, **18% for ★3**, and **3% for ★4**.\n- **Premium Scroll**: These scrolls can summon more powerful characters of ★3 to ★5 rarity. The chances are **20% for ★3**, **70% for ★4**, and **10% for ★5**.\n- **Series Scroll**: These special scrolls summon characters from the featured anime series of the week. Each character in the series has an equal chance of being summoned.\n\nThis week's series: **Cyberpunk Edgerunners**\n⏳ Series scrolls will be refreshed in **1 hour and 26 minutes**!`)
            .addFields(
                {
                    name: '🟢 Basic Owned',
                    value: '0 Basic Scrolls',
                    inline: true
                },
                {
                    name: '🔵 Premium Owned',
                    value: '0 Premium Scrolls',
                    inline: true
                },
                {
                    name: '🟣 Series Owned',
                    value: '0 Series Scrolls',
                    inline: true
                }
            )

        const basicScrollButton = new ButtonBuilder()
            .setCustomId('basic')
            .setLabel('Basic')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🟢');

        const premiumScrollButton = new ButtonBuilder()
            .setCustomId('premium')
            .setLabel('Premium')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔵');

        const SeriesScrollButton = new ButtonBuilder()
            .setCustomId('series')
            .setLabel('Series')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🟣');
        
        const summonComponentRow: any = new ActionRowBuilder()
            .addComponents(
                basicScrollButton,
                premiumScrollButton,
                SeriesScrollButton
            );

        const responseOptions: any = {
            embeds: [summonEmbed],
            components: [summonComponentRow],
        };

        const summonResponse = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            const summonConfirmation = await summonResponse.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (summonConfirmation.customId === 'basic') {
                await summonConfirmation.deferUpdate();
                await summonConfirmation.editReply({
                    components: []
                });
            }
            
        } catch (error) {
            console.log(`Summon Command Error: ${error}`);
        }
    }
}