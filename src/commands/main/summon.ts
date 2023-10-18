import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, MessageComponentInteraction } from "discord.js";
import CharacterModel from "../../models/Character";
import { config } from "../../config";

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

    callback: async function callback (client: Client, interaction: CommandInteraction | CollectedInteraction, followUp = false, back = false) {
        const summonEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Summoning Altar')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Anitopia Summoning Altar! 🎉 This is your go-to place to expand your collection of characters. We offer three types of scrolls, each summoning characters of different rarities.\n\n- **Novice Scroll**: This scroll is your daily chance to summon characters. It can summon characters of **Common (60%)**, **Uncommon (24%)**, **Rare (13%)**, and **Epic (3%)** rarity.\n- **Elite Scroll**: This scroll is for those seeking more powerful characters. It can summon characters of **Uncommon (50%)**, **Rare (42%)**, **Epic (7.5%)**, and even **Legendary (0.5%)** rarity.\n- **Featured Series Packs**: These special packs are unique as they summon not just one, but **three characters** from the featured anime series of the week. The rarity of characters you could summon are **Rare (53%)**, **Epic (43%)**, and **Legendary (4%)**.\n\nThis week's series is **Cyberpunk Edgerunners** and will be refreshed in ⏳ **1 hour and 26 minutes**.`)
            .addFields(
                {
                    name: '🟢 Owned',
                    value: '0 Novice Scroll(s)',
                    inline: true
                },
                {
                    name: '🔵 Owned',
                    value: '0 Elite Scroll(s)',
                    inline: true
                },
                {
                    name: '🟣 Owned',
                    value: '0 Featured Series Pack(s)',
                    inline: true
                }
            )

        const noviceScrollButton = new ButtonBuilder()
            .setCustomId('novice')
            .setLabel('Novice')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🟢');

        const eliteScrollButton = new ButtonBuilder()
            .setCustomId('elite')
            .setLabel('Elite')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔵');

        const featuredScrollButton = new ButtonBuilder()
            .setCustomId('featured')
            .setLabel('Featured')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🟣');
        
        const summonComponentRow: any = new ActionRowBuilder()
            .addComponents(
                noviceScrollButton,
                eliteScrollButton,
                featuredScrollButton
            );

        const responseOptions: any = {
            embeds: [summonEmbed],
            components: [summonComponentRow],
        };

        let summonResponse;
        if (back) {
            await (interaction as MessageComponentInteraction).deferUpdate();
            summonResponse = await interaction.editReply(responseOptions);
        } else {
            summonResponse = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }
        const collectorFilter = (i: { user: { id: string } }) => i.user.id === interaction.user.id;

        try {
            const summonConfirmation = await summonResponse.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (summonConfirmation.customId === 'novice') {
                const noviceScrollEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle('Summoning Altar: Novice Scroll')
                    .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                    .setDescription(`The **Novice Scroll** is quite affordable at just **1,000 coins**, and you even get one free every day! This scroll gives you a chance to summon characters of various rarities. You could find a **Common** character (**60% chance**), an **Uncommon** character (**24% chance**), a **Rare** character (**13% chance**), or if you're really lucky, an **Epic** character (**3% chance**).\n\nYour Novice Scroll: **10** scroll(s).`)
                    .setFooter({
                        text: config.messages.footerText
                    });

                const backButton = new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('Back')
                    .setStyle(ButtonStyle.Secondary);

                const summonOneButton = new ButtonBuilder()
                    .setCustomId('summonOne')
                    .setLabel('Summon 1')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🟣');

                const summonTenButton = new ButtonBuilder()
                    .setCustomId('summonTen')
                    .setLabel('Summon 10')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🟣');

                const noviceSummonComponentRow: any = new ActionRowBuilder()
                    .addComponents(
                        backButton,
                        summonOneButton,
                        summonTenButton
                    );

                await summonConfirmation.deferUpdate();
                const noviceSummonResponse = await summonConfirmation.editReply({
                    embeds: [noviceScrollEmbed],
                    components: [noviceSummonComponentRow]
                });
        
                try {
                    const noviceSummonConfirmation = await noviceSummonResponse.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });
        
                    if (noviceSummonConfirmation.customId === 'back') {
                        this.callback(client, noviceSummonConfirmation, false, true);
                    }
                } catch (error) {

                }

            }
            
        } catch (error) {
            console.log(`Summon Command Error: ${error}`);
        }
    }
}