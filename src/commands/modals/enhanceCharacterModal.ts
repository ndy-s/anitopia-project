import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { CharaCollectionModel, PlayerModel } from "../../models";
import { addExperience, ENHANCE_COST_ANICOIN, ENHANCE_XP_GAIN, getPlayer, MAX_LEVEL, xpToNextLevel } from "../../utils";
import { characterNF } from "../exceptions";
import { config } from "../../config";
import redis from "../../lib/redis";

export default {
    name: 'enhanceCharacterModal',

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const characterIdInput = interaction.fields.getTextInputValue('enhanceCharaIdInput').toUpperCase().trim();

            if (/\s/.test(characterIdInput)) {
                return characterNF(interaction, 'spaces');
            } else if (/[^a-zA-Z0-9]/.test(characterIdInput)) {
                return characterNF(interaction, 'symbols');
            }

            const player = await getPlayer(interaction);
            const collectionEntry = await CharaCollectionModel.findOne({ characterId: characterIdInput }).populate('character');

            if (!collectionEntry) {
                return characterNF(interaction);
            }

            if (String(collectionEntry.playerId) !== String(player._id)) {
                return characterNF(interaction, 'notOwned');
            }

            const characterName = (collectionEntry.character as any)?.name ?? 'This character';

            if (collectionEntry.level >= MAX_LEVEL) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Grey')
                            .setTitle('⚡ Already Max Level')
                            .setDescription(`**${characterName}** (\`${collectionEntry.characterId}\`) is already at the level cap (**Lv. ${MAX_LEVEL}**). Nothing to enhance here!`)
                            .setFooter({ text: config.messages.footerText })
                    ],
                    ephemeral: true,
                });
                return;
            }

            if ((player.balance?.aniCoin ?? 0) < ENHANCE_COST_ANICOIN) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('⚠️ Not Enough AniCoin')
                            .setDescription(`Enhancing costs **${ENHANCE_COST_ANICOIN} AniCoin**, but you only have **${player.balance?.aniCoin ?? 0}**. Play a few duels or battles to earn more, or grab your daily reward!`)
                            .setFooter({ text: config.messages.footerText })
                    ],
                    ephemeral: true,
                });
                return;
            }

            const beforeLevel = collectionEntry.level;
            const { level, experience, levelsGained } = addExperience(collectionEntry.level, collectionEntry.experience, ENHANCE_XP_GAIN);

            await CharaCollectionModel.findByIdAndUpdate(collectionEntry._id, { $set: { level, experience } });

            const updatedPlayer = await PlayerModel.findOneAndUpdate(
                { userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined },
                { $inc: { 'balance.aniCoin': -ENHANCE_COST_ANICOIN } },
                { new: true }
            );

            await redis.set(interaction.user.id, JSON.stringify(updatedPlayer), 'EX', 60);

            const resultEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('⚡ Character Enhanced')
                .setDescription(
                    `**${characterName}** (\`${collectionEntry.characterId}\`) gained **${ENHANCE_XP_GAIN} XP** for **${ENHANCE_COST_ANICOIN} AniCoin**.\n\n` +
                    (levelsGained > 0
                        ? `🎉 Leveled up! **Lv. ${beforeLevel} → Lv. ${level}**`
                        : `**Lv. ${level}** • ${experience}/${xpToNextLevel(level)} XP`)
                )
                .setFooter({ text: config.messages.footerText });

            await interaction.reply({
                embeds: [resultEmbed],
                ephemeral: true,
            });
        } catch (error) {
            console.log(`Handle Submit Modal enhanceCharacterModal Error: ${error}`);
        }
    }
}
