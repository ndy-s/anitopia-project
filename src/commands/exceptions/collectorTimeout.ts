import { AttachmentBuilder, EmbedBuilder } from "discord.js";

const TIMEOUT_MESSAGE = "Collector received no interactions before ending with reason: time";

/**
 * Every command that awaits a button/select-menu response can fail two ways: the 5-minute collector
 * timed out with no click, or something else went wrong. Both cases were already handled per-file with
 * a hand-copied `error.message === "..."` check — consistent where someone remembered to write it, silently
 * skipped where they didn't, which leaves a stale, clickable-looking button that eats the click and does
 * nothing (exactly what looks like "the bot doesn't respond to old results"). Centralizing it here means
 * every command gets identical timeout behavior for free, not "whichever one got copy-pasted correctly."
 *
 * On timeout: disables the message's components and swaps in a footer telling the user to re-run the
 * command. On any other error: logs it, same as every call site already did.
 */
export async function handleCollectorTimeout(
    error: unknown,
    editable: { editReply: (options: { embeds: EmbedBuilder[]; components: []; files?: AttachmentBuilder[] }) => Promise<unknown> },
    embed: EmbedBuilder,
    commandTag: string,
    logLabel: string,
    files?: AttachmentBuilder[]
): Promise<void> {
    if (error instanceof Error && error.message === TIMEOUT_MESSAGE) {
        embed.setFooter({
            text: `⏱️ This command is only active for 5 minutes. To use it again, please run ${commandTag}.`
        });

        await editable.editReply({
            embeds: [embed],
            components: [],
            ...(files ? { files } : {})
        });
    } else {
        console.log(`${logLabel} error: ${error}`);
    }
}
