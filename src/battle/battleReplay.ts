import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CollectedInteraction } from "discord.js";
import { BattleOutcome } from "./runBattle";
import { BattleCharacterView } from "./renderBattleScene";
import { buildBattleIntroEmbed, buildBattleTurnEmbed, buildBattleResultEmbed } from "../embeds/battleEmbed";
import { actionNA } from "../commands/exceptions";

interface ReplyCapable {
    editReply: (options: any) => Promise<any>;
    deferUpdate?: () => Promise<any>;
}

export async function presentBattleReplay(
    replyTarget: ReplyCapable,
    userId: string,
    outcome: BattleOutcome,
    introTeamA: BattleCharacterView[],
    introTeamB: BattleCharacterView[],
    sideALabel: string,
    sideBLabel: string
): Promise<void> {
    const { result, turns } = outcome;
    const lastPage = turns.length + 1; // 0 = intro, 1..N = turns, N+1 = result

    const finalTeamA = turns.length > 0 ? turns[turns.length - 1].teamA : introTeamA;
    const finalTeamB = turns.length > 0 ? turns[turns.length - 1].teamB : introTeamB;

    async function renderPage(index: number) {
        if (index === 0) {
            return buildBattleIntroEmbed(introTeamA, introTeamB, sideALabel, sideBLabel);
        }
        if (index === lastPage) {
            return buildBattleResultEmbed(result, finalTeamA, finalTeamB, sideALabel, sideBLabel);
        }
        return buildBattleTurnEmbed(turns[index - 1], sideALabel, sideBLabel);
    }

    const collectorFilter = (i: CollectedInteraction) => {
        if (i.user.id !== userId) {
            actionNA(i, 'the battle participant');
            return false;
        }
        return true;
    };

    async function showPage(responder: ReplyCapable, pageIndex: number, needsDefer: boolean) {
        const prevButton = new ButtonBuilder()
            .setCustomId('replayPrev')
            .setLabel('◀ Prev')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === 0);
        const nextButton = new ButtonBuilder()
            .setCustomId('replayNext')
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === lastPage);
        const pageLabel = pageIndex === 0 ? 'Battle start'
            : pageIndex === lastPage ? 'Result'
                : `Turn ${turns[pageIndex - 1].turn} · Action ${pageIndex}/${turns.length}`;
        const labelButton = new ButtonBuilder()
            .setCustomId('replayLabel')
            .setLabel(pageLabel)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const page = await renderPage(pageIndex);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, labelButton, nextButton);

        if (needsDefer && responder.deferUpdate) {
            await responder.deferUpdate();
        }

        const response = await responder.editReply({
            embeds: [page.embed],
            files: page.files,
            components: [row],
        });

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000,
            });

            if (confirmation.customId === 'replayPrev') {
                await showPage(confirmation, pageIndex - 1, true);
            } else if (confirmation.customId === 'replayNext') {
                await showPage(confirmation, pageIndex + 1, true);
            }
        } catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                await responder.editReply({ components: [] });
            } else {
                console.log(`Battle replay error: ${error}`);
            }
        }
    }

    await showPage(replyTarget, lastPage, false);
}
