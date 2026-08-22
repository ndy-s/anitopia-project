import { getCommandTag } from "./lib/commandTags";

export const config = {
    messages: {
        footerText: "For assistance or to report issues, please contact our support team.",
    },
    commands: {
        get registerCommandTag() { return getCommandTag('register'); },
        get mainCommandTag() { return getCommandTag('main'); },
        get profileCommandTag() { return getCommandTag('profile'); },
        get summonCommandTag() { return getCommandTag('summon'); },
        get collectionCommandTag() { return getCommandTag('collection'); },
        get teamCommandTag() { return getCommandTag('team'); },
    },
};
