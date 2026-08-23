# Anitopia — Game Mechanics Guide

This is the reference for how Anitopia's battle system actually works, derived directly from the
source code. If this doc and the code ever disagree, that's a bug in the doc — please flag it.

For the project roadmap and what's intentionally out of scope, see `GAME-DESIGN-PLAN.md`. This doc
only describes what's live today.

## Contents

1. [Character stats & rarity](#1-character-stats--rarity)
2. [Leveling](#2-leveling)
3. [Damage formula](#3-damage-formula)
4. [Elemental wheel](#4-elemental-wheel)
5. [Status effects](#5-status-effects)
6. [Skill architecture](#6-skill-architecture)
7. [Class identity](#7-class-identity)
8. [Skill catalog](#8-skill-catalog)
9. [Summon rates & pity](#9-summon-rates--pity)
10. [Visual style](#10-visual-style)
11. [File map](#11-file-map)
12. [Known gaps](#12-known-gaps)

---

## 1. Character stats & rarity

Base attributes (`health`, `attack`, `defense`, `speed`) are authored per character in
`src/charactersData.ts`. Rarity is applied at summon time, not authoring time.

`summonCharacters()` (`src/utils/summonCharacters.ts`) rolls a rarity, then adds a **flat bonus to
all four base attributes**:

| Rarity | Bonus |
|---|---|
| Legendary | +200 |
| Epic | +150 |
| Rare | +100 |
| Uncommon | +50 |
| Common | +0 |

Base stats sit in the 55-98 range, so this flat bonus dominates: a Legendary pull of any character
is statistically much closer to any other Legendary pull than to a lower-rarity copy of the *same*
character. The bonus is stored permanently on `CharaCollectionModel.attributes` at pull time and
never changes again. Level growth and class hooks build on top of it live, in battle, without
touching the stored value.

**Health gets a second multiplier.** Both `duel.ts` and `battle.ts` multiply `attributes.health` by
10 when constructing a battle `Character` (attack/defense/speed are not multiplied). So a Legendary's
+200 bonus becomes +2000 effective HP in battle, while attack only gets +200 flat.

NPC opponents in `/battle` receive the same flat bonus, scaled to the player's average team rarity
(`RARITY_ATTRIBUTE_BONUS` in `battle.ts`), so PvE stays roughly matched to the player's own pull luck.

**Hero vs. Enemy role.** `CharacterModel` has a `role: 'Hero' | 'Enemy'` field (default `'Hero'`).
Enemy-role characters are Tower-only mobs — excluded from both gacha pulls **and** `/battle`'s NPC
pool, since `/battle` pits the player against a random *hero* squad, not monsters. Both
`src/utils/getAllCharacters.ts` (used by `/summon`) and `battle.ts`'s NPC query filter to
`role: 'Hero'`. The first Enemy-role character is **Dire Wolf** (§8) — reserved for the future Tower
system and currently unreachable from any live command, which is intentional.

## 2. Leveling

`src/utils/leveling.ts` is the single source of truth for the XP curve and stat growth.

**XP curve:**
```
xpToNextLevel(level) = round(50 * level^1.5)     for level < 60
xpToNextLevel(60)     = 0   (MAX_LEVEL, capped)
```
A gently accelerating curve — level 1→2 needs 50 XP, level 10→11 needs ~1581, level 30→31 needs
~8216, level 59→60 needs ~22664. `addExperience(currentLevel, currentExperience, gainedXP)` rolls XP
into levels (handling multi-level jumps from a single large grant) and clamps at `MAX_LEVEL`.

**Stat growth:** `applyLevelGrowth(baseStat, level)` multiplies a character's already
rarity-adjusted stored attribute by `1 + 0.02 * (level - 1)` — 2% per level above 1, so roughly +18%
by level 10, +58% by level 30, and ~+118% (more than double) at the level 60 cap. This is computed
**live at battle construction time** in `duel.ts`/`battle.ts` — nothing is ever written back into
`attributes`; level and rarity stay as two independent, stacking multipliers computed fresh every
battle.

**XP sources:**
- **Battles** — `src/battle/awardExperience.ts`'s `awardBattleExperience()` runs after every `/duel`
  and `/battle` resolves. Winners' lineup gets `BATTLE_WIN_XP` (40), losers' gets `BATTLE_LOSS_XP` (12).
- **Enhance** — `/character`'s "Enhance" option opens a modal
  (`commands/modals/enhanceCharacterModal.ts`) asking for a Character ID. Spending
  `ENHANCE_COST_ANICOIN` (300) grants `ENHANCE_XP_GAIN` (80) XP directly. Blocked at `MAX_LEVEL` and
  when the player can't afford it.

`/info` shows real `EXP: {current}/{needed}` via `xpToNextLevel()`.

There's no equipment/item system yet — level and rarity are the only power levers, and every
character grows at the same flat 2%/level rate regardless of rarity or class.

## 3. Damage formula

`calculatePhysicalDamage()` (used for basic attacks and "Damage"-type skill effects):

```
base          = (2 * attack² + attack) / (attack + defense^0.85)
logMultiplier = ln(health) * (random(0, 1.2) - 0.1)
damage        = max(0, ceil(base + logMultiplier))
```

A Pokemon-style attack²-over-(attack+defense) curve, plus a health-scaled random variance term.

Full pipeline order in `inflictDamage`: **accuracy roll → dodge roll → crit (2x, or 2x + Hunter's
crit bonus, see §7) → elemental multiplier (see §4 and §7 for the Mage variant) → target's
`damageReduction` (shield stacking, capped 90%) → Warrior lifesteal (see §7) → wake a sleeping target
if hit (see §5) → `ceil()`**.

Base combat constants:

| Stat | Value |
|---|---|
| Accuracy | 90% |
| Dodge | 2% |
| Crit rate | 5% (15% for Hunter — see §7) |

**"Damage" vs "True Damage" skill effects are different pipelines, not just different numbers:**
- `Damage` (`handleDamageEffect`) reuses `calculatePhysicalDamage()` × the effect's value, then runs
  the *same* dodge → crit → elemental → reduction pipeline as a basic attack.
- `True Damage` (`handleTrueDamageEffect`) is flat `value × attack` — no dodge, no crit, no
  elemental multiplier, no damage reduction.

## 4. Elemental wheel

Eight elements, defined in `Character.ts`:

```
Pyro  → beats Aero,  loses to Aqua
Aqua  → beats Pyro,  loses to Volt
Volt  → beats Aqua,  loses to Terra
Terra → beats Volt,  loses to Aero
Aero  → beats Terra, loses to Pyro
Lumen → beats Shade, loses to Shade   (mutual matchup, no clear order)
Shade → beats Lumen, loses to Lumen   (mutual matchup, no clear order)
Neutralis → immune to advantage or disadvantage either way
```

Base multiplier spread is **1.5x advantage / 0.75x disadvantage** (Mage class uses a wider 1.75x/0.6x
spread — see §7). All 8 elements are represented across the current roster (§8).

## 5. Status effects

The engine implements the full debuff/buff catalog. Most are just the generic `Debuff`/`Buff` types
authored with a different `attribute`; a handful needed real new mechanics (turn-skipping, delayed
detonation, debuff immunity).

**Expressed via the generic `Debuff`/`Buff` types** (attach `attribute` to any stat):

| Status | Attribute | Direction |
|---|---|---|
| Blindness | Accuracy | Debuff |
| Slow | Speed | Debuff |
| Weaken | Attack | Debuff |
| Armor Break | Defense | Debuff |
| Frostbite | Speed + Attack (two entries) | Debuff |
| Strengthen | Attack | Buff |
| Haste | Speed | Buff |
| Protection | Defense | Buff |

**Dedicated `effect.type` handlers:**

| Status | Handler | Behavior |
|---|---|---|
| Poison | `handlePoisonEffect` | % of max HP per turn, same math as Bleed |
| Bleed | (built-in) | % of max HP per turn |
| Critical Boost | `Buff` + `attribute: CritRate` | Buffs crit rate directly (routed through `ATTRIBUTE_PROPERTY_ALIASES` so `CritRate` maps to the real `critRate` property) |
| Burn | `handleBurnEffect` | True-damage DoT — the tick is a **% of the triggering hit's damage** (`displayDamage`), not % of max HP, so the skill's `Damage`/`True Damage` effect must be listed *before* the Burn effect in the same `effects` array |
| Time Bomb | `handleTimeBombEffect` | Same "% of triggering hit's damage" rule as Burn, but doesn't tick — detonates once for the stored amount when its duration expires |
| Paralysis | `handleParalysisEffect` | Fixed **-40% speed** (`PARALYSIS_SPEED_REDUCTION`) plus a fixed **25% chance per turn** (`PARALYSIS_SKIP_CHANCE`) to lose the turn entirely. The skill's own `chance` field only controls whether Paralysis gets applied in the first place — the skip chance is a fixed property of the status itself |
| Freeze | `handleFreezeEffect` | Guaranteed full turn-skip every turn the status is active |
| Sleep | `handleSleepEffect` | Guaranteed turn-skip unless the character wakes — **75% chance** (`SLEEP_SELF_WAKE_CHANCE`) to self-wake at the start of their turn, or instant wake the moment they take any hit with damage > 0 (`wakeIfHit()`) |
| Silence | `handleSilenceEffect` | Doesn't skip the turn — forces the basic-attack branch even when the active skill's cooldown is ready. Cooldown still counts down while silenced |
| Aegis | `handleAegisEffect` | Ally-targeted debuff immunity — every debuff/DoT handler checks `isAegisProtected()` first and no-ops if the target is protected. Damage-type effects are unaffected |
| Double Attack | `handleDoubleAttackEffect` | Self-buff — while active, basic attacks roll and apply a second independent damage instance, summed into the turn's `displayDamage` |

**Turn-skip is its own `actionType`.** `BattleTurnEvent.actionType` includes `'skipped'` alongside
`'attack'`/`'active'`; `buildBattleTurnEmbed` renders a dedicated line for it ("X is frozen solid /
fast asleep / paralyzed and can't move!").

## 6. Skill architecture

Skills are split into a shared mechanical template and per-character flavor, so numbers never drift
from what's displayed.

- `SkillModel` documents are mechanic *templates* (19 total — 9 passive, 10 active; full catalog in
  §8). Each carries the real mechanical numbers (effects, trigger, target, cooldown) across all 5
  rarity tiers, plus a `descriptionTemplate` string.
- `charactersData.ts` gives each character a flavor `name`, a `flavorTemplate` string, and a
  `skillRef` string that resolves to the template's ObjectId at seed time.
- In battle, `Character.ts` runs the numbers from the referenced template but displays the
  character's own flavor name.

**Flavor text is derived, not duplicated.** Both a character's `flavorTemplate` and a skill
template's `descriptionTemplate` are strings with `{v#}`/`{c#}`/`{d#}` placeholders, resolved against
the live `rarityEffects[tier].effects` array by `src/utils/resolveSkillFlavorText.ts`:
`{v1}`/`{v2}`/... map to each effect's `value` (as a percentage, 1-indexed by position), `{c1}`/... to
`chance`, `{d1}`/... to `duration`. Neither layer can drift from the real numbers because both read
them instead of restating them.

**Target selection** (`activateSkill()` in `Character.ts`) resolves a skill's `target` field against
the full `enemies`/`allies` rosters passed in from `runBattle.ts`, which include already-dead members.
`Highest Health`/`Lowest Health`/`Random` all filter to living entities (`health > 0`) before picking,
falling back to the unfiltered list only if everyone in it is dead. This matters most for `Lowest
Health` (`Guardian's Blessing`, `Healing Touch`): without the filter, a dead ally's health always sits
at or below any living member's, so a Support's heal/shield passive would always resurrect a fallen
teammate instead of helping the lowest-HP living one.

## 7. Class identity

| Class | Hook | Implementation |
|---|---|---|
| **Tank** | Draws single-target selection | `pickPrimaryTarget()` in `runBattle.ts` prefers an alive Tank over the default first-alive pick, for basic attacks and single-target skills |
| **Mage** | Amplified elemental swing | 1.75x (up from 1.5x) on advantage, 0.6x (down from 0.75x) on disadvantage |
| **Hunter** | Crit-rate baseline | +10% crit rate at construction (5% → 15%) |
| **Warrior** | Lifesteal | Heals 10% of any damage dealt, capped at max health |
| **Support** | Amplified support effects | `Heal`/`Buff`/`Shield` effect values ×1.2 when the caster is Support |

## 8. Skill catalog

**Passive skills** (`src/passiveSkillsData.ts`):

| Skill | Trigger | Target | Effect (Common → Legendary) | Used by |
|---|---|---|---|---|
| Battlefield Roar | Battle Start | Area | Team-wide Attack buff: +20/25/30/35/40% (permanent) | Roy Mustang, Megumin, Dire Wolf |
| Guardian's Blessing | Each Turn | Lowest Health | Chance Shield: 22/24/26/28/30% chance, 15/20/25/30/35% reduction, 1 turn | Orihime, Momo Yaoyorozu |
| Healing Touch | Each Turn | Lowest Health | Chance Heal: 22/24/26/28/30% chance, 5/8/11/14/18% of max HP | Nami, Rem |
| Resilience Boost | Health -50% | Single | Self Attack +30/35/40/45/50%, Speed +50/55/60/65/70%, 3 turns, one-shot | Kirito, Yuno, Yoruichi |
| Fortitude | Damage Taken | Single | Self damage reduction: 5/10/15/20/25%, re-applies every hit | All Might, Gaara |
| Bleeding Strike | Attack | Single | Chance Bleed: 10/15/20/25/30% chance, 5% max HP/turn, 3 turns | Mikasa, Killua |
| Second Wind | Health -25% | Single | Self Attack +35/40/45/50/55%, Speed +55/60/65/70/75%, 3 turns, one-shot | Naruto |
| Lifesteal | Attack | Single | Chance self-Heal: 25/28/31/34/38% chance, 8/10/12/14/16% of max HP | Himiko Toga, Ken Kaneki |
| Corrosive Touch | Attack | Single | Chance Poison: 30/33/36/39/42% chance, 5% max HP/turn, 2 turns | Rimuru Tempest |

**Active skills** (`src/activeSkillsData.ts`) — cooldown gated:

| Skill | Cooldown | Target | Effect (Common → Legendary) | Used by |
|---|---|---|---|---|
| Elemental Strike | 3 | Single | Elemental Damage: 130/135/140/145/150% | Roy Mustang, Orihime |
| Elemental Burst | 4 | Area | Elemental Damage (all): 105/110/115/120/125% | Yuno, Killua |
| True Damage Strike | 3 | Single | True Damage: 150/155/160/165/170% of attack | Kirito, All Might, Gaara, Rem, Dire Wolf |
| True Damage Burst | 4 | Area | True Damage (all): 125/130/135/140/145% of attack | Mikasa, Yoruichi |
| Blind Fog | 3 | Area | Accuracy Debuff (all): -20/25/30/35/40%, 2 turns | Nami, Momo Yaoyorozu |
| Stunning Blow | 3 | Single | Damage 150/155/160/165/170% + chance Paralysis: 40/45/50/55/60% chance, 2 turns | Naruto |
| Explosive Strike | 3 | Single | Damage 150/155/160/165/170% + chance Burn: 40/45/50/55/60% chance, 35% of hit dmg/turn, 2 turns | Megumin |
| Silencing Strike | 3 | Single | Damage 120/125/130/135/140% + chance Silence: 40/45/50/55/60% chance, 2 turns | Himiko Toga |
| Boost Strike | 3 | Single | Self Attack + Defense: 10/15/20/25/30% (both), 3 turns | Ken Kaneki |
| Freezing Strike | 4 | Single | Damage 140/145/150/155/160% + chance Freeze: 30/33/36/39/42% chance, 2 turns | Rimuru Tempest |

**Character → skill map** (18 characters; role noted only for the 1 Enemy):

| Character | Class | Element | Role | Passive | Active |
|---|---|---|---|---|---|
| Kirito | Warrior | Neutralis | Hero | Dual Wielding → Resilience Boost | Starbust Stream → True Damage Strike |
| Yuno | Mage | Aero | Hero | Spirit Dive → Resilience Boost | Spirit Storm → Elemental Burst |
| All Might | Tank | Neutralis | Hero | One For All → Fortitude | United State of Smash → True Damage Strike |
| Mikasa | Hunter | Neutralis | Hero | Ackerman Instincts → Bleeding Strike | Blade Frenzy → True Damage Burst |
| Roy Mustang | Mage | Pyro | Hero | State Alchemist's Command → Battlefield Roar | Flame Alchemy: Snap → Elemental Strike |
| Nami | Support | Aqua | Hero | Navigator's Watch → Healing Touch | Mirage Tempo → Blind Fog |
| Killua | Hunter | Volt | Hero | Thunderbolt's Afterimage → Bleeding Strike | Lightning Palm → Elemental Burst |
| Gaara | Tank | Terra | Hero | Sand Armor → Fortitude | Desert Funeral → True Damage Strike |
| Yoruichi | Warrior | Shade | Hero | Shunkō Awakening → Resilience Boost | Flash Goddess's Onslaught → True Damage Burst |
| Orihime | Support | Lumen | Hero | Santen Kesshun → Guardian's Blessing | Koten Zanshun → Elemental Strike |
| Momo Yaoyorozu | Support | Neutralis | Hero | Quick Creation → Guardian's Blessing | Flash Bang Grenade → Blind Fog |
| Rem | Support | Aqua | Hero | Oni Bloodline → Healing Touch | Morningstar → True Damage Strike |
| Naruto | Warrior | Aero | Hero | Nine-Tails Chakra Mode → Second Wind | Rasengan → Stunning Blow |
| Megumin | Mage | Pyro | Hero | Crimson Affinity → Battlefield Roar | Explosion → Explosive Strike |
| Himiko Toga | Hunter | Shade | Hero | Bloodsucker → Lifesteal | Chilling Whisper → Silencing Strike |
| Ken Kaneki | Warrior | Shade | Hero | Ghoul Physiology → Lifesteal | Kagune Awakening → Boost Strike |
| Rimuru Tempest | Mage | Aqua | Hero | Predator → Corrosive Touch | Ice Blade → Freezing Strike |
| Dire Wolf | Warrior | Terra | **Enemy** | Pack Leader → Battlefield Roar | Pounce → True Damage Strike |

## 9. Summon rates & pity

Three scroll types, each with its own rarity table (`summon.ts`), passed to `summonCharacters()`:

| Rarity | Novice | Elite | Series |
|---|---|---|---|
| Common | 60% | 0% | 0% |
| Uncommon | 24% | 50% | 0% |
| Rare | 13% | 42% | 53% |
| Epic | 3% | 7.5% | 43% |
| Legendary | 0% | 0.5% | 4% |

Novice scrolls can never naturally roll Legendary. Series scrolls can't roll Common/Uncommon at all.

**Pity system:** each scroll type tracks a `guaranteed` counter (resets to 100). The pity check is
`guaranteed === 0` — exact equality, not `<= 0` — so it fires exactly once per crossing.

## 10. Visual style

Battle results are split across two layers that are built together but serve different jobs: the
**embed text** (native Discord formatting) carries every number a player needs to read precisely, and
the **canvas image** below it is a small, purely decorative pixel-art scene. Earlier versions tried to
render names/HP/cooldowns as text baked into the canvas itself — that's gone; canvas text doesn't
reflow, doesn't wrap well on mobile, and duplicated what the embed already says better.

**Embed text** (`src/embeds/battleEmbed.ts`), one field per side, five lines per character:
```
Mikasa LV.45 [Warrior icon] [Terra icon]
★★★★★
4000/4000 [heart icon]
████████████
 ▰▱▱▱▱▱▱▱
```
- Class and element are icons, not text, on the name/level line — `getClassEmoji()`
  (`src/utils/classEmoji.ts`) and `getElementEmoji()` (`src/utils/elementEmoji.ts`) — see the
  Application Emoji section below.
- Rarity: `★`/`☆` out of 5, via `RARITY_STAR_COUNT` (`pixelPalette.ts`).
- HP is shown as absolute numbers (`current/max`) next to a heart icon — the game's own generated
  heart asset, not a stock emoji: the full red heart at any HP above 0, a grayed-out cracked variant
  (`heart-broken.png`) at exactly 0, via `heartEmoji()` in `battleEmbed.ts`. Below that, a 12-segment
  `█`/`░` bar with no numbers on the bar itself.
- Skill gauge: 8 segments, `▰`/`▱` — deliberately a different glyph and length from the HP bar so the
  two read as distinct at a glance. Fill tracks `(maxCooldown - currentCooldown) / maxCooldown`, always
  at least 1 segment filled (even right after using the skill) so the gauge is never a single repeated
  glyph with nothing else on the line — Discord's client renders an all-one-glyph line "jumbo"
  (oversized), the same way it does an all-emoji message; the gauge line also starts with a
  non-breaking space (not a plain space — Discord's markdown trims plain leading spaces) as a
  belt-and-suspenders guard against the same issue.
- Field names are the team's actual name from `ITeams.name` (the Team collection), not a generic
  "Team A"/"Team B" placeholder — same for the attacker/target tags in the turn narrative.
- A defeated character (0 HP) renders with the exact same five lines as anyone else, just at `0/max`
  with the broken-heart icon — it does not collapse into a separate "KO" line or get struck through.
- Turn order is title `[Turn N]` → the two team stat fields (side by side) → a `[Battle Log]` field
  with the turn's narrative text, in that order — the narrative isn't in the embed's `description`,
  since Discord always renders `description` directly under the title, before any fields, with no way
  to push it below them; putting it in a trailing non-inline field instead is what gets character stats
  to appear first. The intro embed follows the same pattern — its "Let the fight begin!" line lives in
  its own `[Battle Log]` field too, not the description, for the same reason.
- Narrative-line markers: 🔸 (small orange diamond) for the acting character's basic attack or active
  skill line, 🔹 (small blue diamond) for a passive activation line — the two colors distinguish
  "something the character chose to do this turn" from "a passive that triggered as a side effect."

**Canvas scene** (`src/battle/renderBattleScene.ts`) — hand-built pixel art, drawn on a boolean pixel
grid and rasterized with `ctx.imageSmoothingEnabled = false` so edges stay crisp instead of
anti-aliased. Right-sized to the roster instead of a fixed oversized canvas: header text, then each
team's sprites (element icon per character, up to 3) arranged in a row standing on a grass ground
strip, with a thin HP sliver under each sprite for an at-a-glance read. Attacker/target/skill-user/
passive-user are called out with colored borders and a small marker, matching the embed's turn
narrative. Every character displays their element's icon rather than an individual portrait, so the
whole roster renders with one consistent visual language instead of mixing detailed art with
icon-only characters.

- **Font** (`pixelFont.ts`) — a hand-authored 5x7 bitmap font, uppercase-only, used only for the
  scene's header/side-label text now (per-character stats moved to the embed, above).
- **Shapes** (`pixelShapes.ts`) — icons are composed from boolean-grid primitives (circles, triangles,
  diamonds, polylines, rects) rather than hand-placed pixels. `computeOutline` auto-derives a 1px
  black outline from any shape, and `rasterizeIcon` paints a top/bottom two-tone split for a cheap
  pseudo-light effect (`shadeThreshold` param controls where the split falls, default 0.55 — push it
  lower for tall shapes like letterforms).
- **Palette** (`pixelPalette.ts`) — one shared palette (`PIXEL`, including `grass`/`grassLight` for the
  ground strip), a rarity color map (`RARITY_COLOR`), element fill/shade pairs (`ELEMENT_COLOR`), and
  class fill/shade pairs (`CLASS_COLOR`, deliberately distinct hues from `ELEMENT_COLOR` even where a
  class and element land in the same rough color family) — all used by both the icon generator and the
  battle scene renderer, keeping them visually consistent.

**Class icons** (added alongside elements): Warrior is a sword, Mage a wand with an orb tip, Tank a
shield, Hunter a bow and arrow, Support a plus/cross (deliberately not a heart, since that's reserved
for the HP indicator). Shapes are chosen to stay legible at icon scale and to avoid echoing an
element's silhouette (Mage avoids a plain triangle since Pyro/Terra already use one).

**HP heart icons**: `heart.png` (vibrant red, used above 0 HP) and `heart-broken.png` (the same
silhouette with a jagged crack subtracted through the middle, in a grayed-out palette — built by
generating the crack as its own temporary grid via `unionPolyline()` and `subtractGrid()`-ing it out
of a copy of the normal heart shape). Both are game assets, not stock emoji.

**Regenerating assets** (both are checked-in dev tools, not run at bot startup):
- `pnpm exec tsx src/battle/generatePixelIcons.ts` rebuilds all 25 icon PNGs (8 elements, 5 classes, 5
  rarity, 2 currency, 3 scrolls, 2 hearts) into `src/public/icons/**`.
- `pnpm exec tsx src/battle/generateBrandMark.ts` rebuilds `anitopia_icon.png` and `anitopia_logo.png`
  from the same shape/font/palette system.

**Discord Application Emoji trap:** `anicoin`, `anicrystal`, `scroll_novice`, `scroll_elite`,
`scroll_series`, all 8 `element_*` icons, all 5 `class_*` icons, and `heart`/`heart_broken` are
registered as Discord Application Emojis (`src/events/ready/05registerAppEmojis.ts`), used via
`getButtonEmoji()`/`getAppEmojiMention()` (the element/class ones specifically through
`getElementEmoji()`/`getClassEmoji()`, and the hearts through `heartEmoji()` in `battleEmbed.ts` —
all three fall back to a plain Unicode emoji if the Application Emoji hasn't finished registering yet,
e.g. the very first boot). Discord uploads an emoji's image once and keys it by name — the
registration logic reuses the existing emoji ID by name forever, and never re-uploads just because the
local PNG changed. **Whenever one of these 20 files is regenerated, its Discord Application Emoji must
be manually deleted via the API before the next bot restart**, so `05registerAppEmojis.ts` falls
through to its create branch and uploads the new art fresh. Every other
icon (rarity, brand mark) is served as a plain file attachment, not an Application Emoji, so this trap
is specific to just these 20.

## 11. File map

| System | File(s) |
|---|---|
| Battle engine (stats, damage, skills, status, class hooks) | `src/classes/Character.ts` |
| Turn loop, passive trigger timing, Tank taunt, Freeze/Sleep/Paralysis skip logic | `src/battle/runBattle.ts` |
| Post-battle XP awarding | `src/battle/awardExperience.ts` |
| Leveling curve, stat growth, Enhance constants | `src/utils/leveling.ts` |
| Flavor-text interpolation | `src/utils/resolveSkillFlavorText.ts` |
| Skill mechanic templates (seed data) | `src/passiveSkillsData.ts`, `src/activeSkillsData.ts` |
| Character roster + flavor skill templates (seed data) | `src/charactersData.ts` |
| Skill/Character Mongo schemas (incl. `role` field) | `src/models/SkillModel.ts`, `src/models/CharacterModel.ts` |
| Per-player character instances, level/exp fields | `src/models/CharaCollectionModel.ts` |
| Enhance modal (spend AniCoin for XP) | `src/commands/modals/enhanceCharacterModal.ts` |
| Rarity → attribute bonus, pity | `src/utils/summonCharacters.ts`, `src/commands/main/summon.ts` |
| Hero-only filter for gacha pools | `src/utils/getAllCharacters.ts` |
| Rarity enum ↔ string mapping | `src/utils/mapRarity.ts` |
| Battle visuals (incl. skipped-turn narrative) | `src/battle/renderBattleScene.ts`, `src/embeds/battleEmbed.ts` |
| Pixel-art font, shapes, palette | `src/battle/pixelFont.ts`, `src/battle/pixelShapes.ts`, `src/battle/pixelPalette.ts` |
| Icon/brand-mark regeneration tools (dev tools, not runtime) | `src/battle/generatePixelIcons.ts`, `src/battle/generateBrandMark.ts` |
| Shared collector-timeout handling (disables stale buttons/menus) | `src/commands/exceptions/collectorTimeout.ts` |
| Source brainstorm spreadsheets | `design-docs/game-design/*.xlsx` |

## 12. Known gaps

Ranked roughly by leverage:

1. **No equipment/item system** — rarity + level are the only power levers.
2. **A few status mechanics are engine-verified but not authored into any live skill yet**: Sleep,
   Aegis, Time Bomb, Double Attack, Critical Boost, plus Slow/Weaken/Armor Break/Frostbite as
   standalone skills. All work correctly, they just don't have a character whose kit calls for them.
3. **Support has 3 Hero characters vs. 2 for every other class** — minor roster balance drift, worth
   correcting in the next content batch.
4. **Roster size** — 18 characters today; `GAME-DESIGN-PLAN.md` targets 20–30 for a real v1.
5. **No active skill is primarily Heal/Buff/Shield** — the current support-flavored actives are still
   reflavored offense (debuffs/damage), not pure support tools.
6. **`/duel`'s "Team of 5" option is permanently disabled** — 5v5 duels are scaffolded (the button
   exists) but never implemented.
7. **`/duel` still can't be nested inside `/main`'s menu** — it requires a `user` slash-command option
   that can only be supplied when the command is invoked directly, so there's no way to collect it
   from a plain select-menu click. `/battle` doesn't have this problem (see below) and is nested.

**Resolved:** `/battle` used to point players at typing the command directly instead of nesting inside
`/main`, because `runBattle`'s per-turn callback called `interaction.editReply()` on the original
interaction — which targets the wrong message once `/battle` is invoked via `followUp()` from another
command's menu. Fixed by extracting the battle flow into `runBattleForPlayer()` (`battle.ts`), which
takes a `respond` callback instead of assuming `interaction.editReply()`. The direct `/battle` command
passes `interaction.reply`/`interaction.editReply`; `/main`'s "Battle" menu option now shows a "Start
Battle" button and passes the button's own `editReply` (after `deferUpdate()`) — a component
interaction's `editReply()` always targets the message it's attached to correctly, regardless of how
that message was created, so this sidesteps the original mismatch entirely instead of threading a raw
`Message` reference through the turn loop.
