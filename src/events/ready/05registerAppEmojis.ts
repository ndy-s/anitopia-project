import { Client } from "discord.js";
import * as path from "path";
import { setAppEmoji } from "../../lib/appEmojis";

const APP_EMOJIS = [
    { name: 'anicoin', file: 'currency/currency-anicoin.png' },
    { name: 'anicrystal', file: 'currency/currency-anicrystal.png' },
    { name: 'scroll_novice', file: 'scrolls/scroll_novice.png' },
    { name: 'scroll_elite', file: 'scrolls/scroll_elite.png' },
    { name: 'scroll_series', file: 'scrolls/scroll_series.png' },
    { name: 'element_pyro', file: 'elements/element-pyro.png' },
    { name: 'element_aqua', file: 'elements/element-aqua.png' },
    { name: 'element_volt', file: 'elements/element-volt.png' },
    { name: 'element_terra', file: 'elements/element-terra.png' },
    { name: 'element_aero', file: 'elements/element-aero.png' },
    { name: 'element_lumen', file: 'elements/element-lumen.png' },
    { name: 'element_shade', file: 'elements/element-shade.png' },
    { name: 'element_neutralis', file: 'elements/element-neutralis.png' },
    { name: 'class_warrior', file: 'classes/class-warrior.png' },
    { name: 'class_mage', file: 'classes/class-mage.png' },
    { name: 'class_tank', file: 'classes/class-tank.png' },
    { name: 'class_hunter', file: 'classes/class-hunter.png' },
    { name: 'class_support', file: 'classes/class-support.png' },
    { name: 'heart', file: 'misc/heart.png' },
    { name: 'heart_broken', file: 'misc/heart-broken.png' },
];

export default async (client: Client) => {
    try {
        if (!client.application) {
            console.error('Registering app emojis error: client.application is not available.');
            return;
        }

        const existingEmojis = await client.application.emojis.fetch();

        for (const { name, file } of APP_EMOJIS) {
            const existing = existingEmojis.find((emoji) => emoji.name === name);

            if (existing?.id) {
                setAppEmoji(name, existing.id);
                continue;
            }

            const created = await client.application.emojis.create({
                name,
                attachment: path.join(__dirname, '..', '..', 'public', 'icons', file),
            });

            setAppEmoji(name, created.id as string);
            console.log(`Uploaded application emoji :${name}:`);
        }
    } catch (error) {
        console.error(`Registering app emojis error: ${error}`);
    }
};
