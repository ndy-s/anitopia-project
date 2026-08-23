import { Client, ChatInputCommandInteraction, CommandInteraction, CollectedInteraction, EmbedBuilder } from "discord.js";
import { Character } from "../../classes/Character";
import { Team } from "../../classes/Team";
import { getPlayer, mapRarity, applyLevelGrowth } from "../../utils";
import { IPlayerModel, ITeams } from "../../interfaces";
import { CharacterModel } from "../../models";
import { config } from "../../config";
import { runBattle, snapshotTeam } from "../../battle/runBattle";
import { presentBattleReplay } from "../../battle/battleReplay";
import { awardBattleExperience } from "../../battle/awardExperience";
import { buildBattleIntroEmbed, buildBattleTurnEmbed } from "../../embeds/battleEmbed";

enum Rarity {
    Legendary = 1,
    Epic = 2,
    Rare = 3,
    Uncommon = 4,
    Common = 5,
}

const RARITY_ATTRIBUTE_BONUS: Record<number, number> = {
    [Rarity.Legendary]: 200,
    [Rarity.Epic]: 150,
    [Rarity.Rare]: 100,
    [Rarity.Uncommon]: 50,
    [Rarity.Common]: 0,
};

const NPC_TEAM_SIZE = 3;

const shuffle = <T>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

interface ReplyCapable {
    editReply: (options: any) => Promise<any>;
    deferUpdate?: () => Promise<any>;
}

// Core battle flow, decoupled from how its messages get sent/edited so it can run either as the
// direct `/battle` command (reply → editReply on the same interaction) or nested inside another
// message's button flow (update/editReply scoped to that button's own interaction). `respond` is
// called once to send the first message, then again on every subsequent turn to edit it in place —
// the caller decides what "send" vs "edit" means for its own interaction. `replayTarget` is passed
// straight through to `presentBattleReplay`, which needs its own `editReply`/`deferUpdate` pair.
export async function runBattleForPlayer(
    interaction: CommandInteraction | CollectedInteraction,
    respond: (options: { embeds: EmbedBuilder[]; files?: any[]; ephemeral?: boolean }) => Promise<any>,
    replayTarget: ReplyCapable
): Promise<void> {
    const player: IPlayerModel = await getPlayer(interaction);

    const findTeam = (playerModel: IPlayerModel, teamName: string | null): ITeams | undefined =>
        playerModel.teams.find((team) => team.name === teamName);

    const activeTeamOfThree = findTeam(player, player.activeTeams.teamOfThree);
    const teamHasCharacters = (team: ITeams | undefined): boolean =>
        team?.lineup.some((member) => member.character !== null) ?? false;

    if (!teamHasCharacters(activeTeamOfThree)) {
        await respond({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('⚠️ No Active Team')
                    .setDescription(`You haven't set up an active team yet, or your team doesn't have any characters. Set one up with ${config.commands.teamCommandTag} before challenging a random opponent.`)
                    .setFooter({ text: config.messages.footerText })
            ],
            ephemeral: true,
        });
        return;
    }

    const convertMapToObject = (mapOrObject: Map<string, any> | { [key: string]: any }): { [key: string]: any } => {
        if (mapOrObject instanceof Map) {
            return Object.fromEntries(mapOrObject);
        }
        return { ...mapOrObject };
    };

    const characterDataPlayer = (activeTeamOfThree as ITeams).lineup.map((characterObject: any) => {
        if (characterObject && characterObject.character) {
            const level = characterObject.character.level;
            return new Character(
                characterObject.character.character.name,
                applyLevelGrowth(characterObject.character.attributes.health, level) * 10,
                applyLevelGrowth(characterObject.character.attributes.attack, level),
                applyLevelGrowth(characterObject.character.attributes.defense, level),
                applyLevelGrowth(characterObject.character.attributes.speed, level),
                level,
                characterObject.character.rarity,
                characterObject.character.character.element,
                characterObject.character.character.class,
                characterObject.character.character.passiveSkill.name,
                characterObject.character.character.passiveSkill.skill,
                convertMapToObject(characterObject.character.character.passiveSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)],
                characterObject.character.character.activeSkill.name,
                characterObject.character.character.activeSkill.skill,
                convertMapToObject(characterObject.character.character.activeSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)]
            );
        }
        return null;
    }).filter((character: Character | null) => character !== null) as Character[];

    const playerRarities = (activeTeamOfThree as ITeams).lineup
        .map((member: any) => member?.character?.rarity)
        .filter((rarity: number | undefined) => typeof rarity === 'number') as number[];
    const averageRarity = playerRarities.length
        ? Math.round(playerRarities.reduce((sum, rarity) => sum + rarity, 0) / playerRarities.length)
        : Rarity.Common;
    const npcRarity = Math.min(Rarity.Common, Math.max(Rarity.Legendary, averageRarity));

    // Enemy-role characters (e.g. Dire Wolf) are Tower-only mobs, not valid /battle rivals or
    // gacha pulls — see design-docs/GAME-MECHANICS-GUIDE.md §1 for the role split.
    const allCharacters = await CharacterModel.find({ role: 'Hero' })
        .populate('activeSkill.skill')
        .populate('passiveSkill.skill');

    if (allCharacters.length < NPC_TEAM_SIZE) {
        await respond({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('⚠️ Not Enough Characters')
                    .setDescription(`There aren't enough characters in the roster yet to build an opponent team.`)
            ],
            ephemeral: true,
        });
        return;
    }

    const npcCharacterDocs = shuffle(allCharacters).slice(0, NPC_TEAM_SIZE);
    const characterDataNpc = npcCharacterDocs.map((character: any) => {
        const bonus = RARITY_ATTRIBUTE_BONUS[npcRarity];

        return new Character(
            character.name,
            (character.attributes.health + bonus) * 10,
            character.attributes.attack + bonus,
            character.attributes.defense + bonus,
            character.attributes.speed + bonus,
            1,
            npcRarity,
            character.element,
            character.class,
            character.passiveSkill.name,
            character.passiveSkill.skill,
            convertMapToObject(character.passiveSkill.skill.rarityEffects)[mapRarity(npcRarity)],
            character.activeSkill.name,
            character.activeSkill.skill,
            convertMapToObject(character.activeSkill.skill.rarityEffects)[mapRarity(npcRarity)]
        );
    });

    const teamA = new Team(characterDataPlayer);
    const teamB = new Team(characterDataNpc);

    const sideALabel = (activeTeamOfThree as ITeams).name;
    const sideBLabel = `Rival Squad (${mapRarity(npcRarity)})`;

    const introTeamA = snapshotTeam(characterDataPlayer);
    const introTeamB = snapshotTeam(characterDataNpc);

    const intro = await buildBattleIntroEmbed(introTeamA, introTeamB, sideALabel, sideBLabel);
    await respond({
        embeds: [intro.embed],
        files: intro.files,
    });

    const outcome = await runBattle(teamA, teamB, async (event) => {
        const turnScene = await buildBattleTurnEmbed(event, sideALabel, sideBLabel);
        await respond({
            embeds: [turnScene.embed],
            files: turnScene.files,
        });
    });

    await awardBattleExperience((activeTeamOfThree as ITeams).lineup, outcome.result === 'A');

    await presentBattleReplay(replayTarget, interaction.user.id, outcome, introTeamA, introTeamB, sideALabel, sideBLabel);
}

export default {
    name: 'battle',
    description: 'Battle a random AI-controlled team to test your squad',
    cooldown: 10_000,
    options: [],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: ChatInputCommandInteraction) => {
        let sent = false;
        const respond = async (options: any) => {
            if (!sent) {
                sent = true;
                await interaction.reply(options);
            } else {
                await interaction.editReply(options);
            }
        };

        await runBattleForPlayer(interaction, respond, interaction);
    }
};
