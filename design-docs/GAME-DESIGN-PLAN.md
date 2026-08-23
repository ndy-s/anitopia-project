# Anitopia — Game Design Plan

Written 2026-08-22, after reading every file in `design-docs/` and cross-checking each claim against
the actual TypeScript implementation in `src/`. Where the old docs and the code disagree, the code
wins — this plan describes what's real and what to build next, not what was once brainstormed.

## 1. The core problem: docs describe a live-service gacha game, code is a lean MVP

Across `game-design/Anitopia General Concept.xlsx` and `game-design/Anitopia Development Guide.xlsx`,
the documented scope includes a guild system, a dungeon system, a floor/tower system per anime series,
altar commands, and a roster pulled from ~100 characters across a dozen-plus anime (Naruto, MHA,
KonoSuba, Overlord, BlazBlue, To Love Ru, SAO, and more).

None of that exists in code. What's actually built is a tight, coherent PvP gacha loop:

**Register → daily free Novice summon → Collection → Team → Duel**, with a real 5-tier rarity system,
real pull rates, and a weekly-rotating Featured Series scroll that's genuinely wired into
`WeeklySeriesModel` + a cron job (`src/events/ready/04weeklySeriesCronJob.ts`) — not just a spec on
paper.

This is the single most important thing to internalize: **the design docs are a wishlist, the code is
a shippable v1 core.** The fix isn't to build more toward the wishlist — it's to stop treating the
wishlist as the roadmap, ship the core loop well, and pull from the wishlist one system at a time only
after the core loop has real players.

## 2. Update: the combat-engine gap this section originally flagged is closed

This section originally flagged two gaps: only 2 of 8 elements had characters using them, and class
was flavor-only with no combat hook. Both are now closed — see `GAME-MECHANICS-GUIDE.md` §4 and §7.
All 8 elements have Hero-role characters, and all 5 classes (including Support) have a real mechanical
hook wired into `Character.ts`/`runBattle.ts`. Kept this section as a record of the original finding
since it's what set the current priority order; treat §3 below as what's still open, not what's next.

## 3. Recommended v1 scope

Of the original four recommendations here, the first three are done (class mechanical identity,
element-wheel content coverage, Support as a real 5th class). What's left:

1. **Roster target: 20–30 characters for a real v1**, not the ~100-character sprawl across
   `Anitopia General Concept.xlsx` / `Anitopia Development Guide.xlsx`. Currently at 18. Pick 4–6 anime
   series you can commit to covering well (art, skills, quotes) rather than one-off characters from a
   dozen shows — this also makes the weekly Featured Series rotation (which pulls by `series` name)
   actually feel like a rotation instead of mostly single-character series.
2. **Support is overrepresented relative to the other 4 classes** (3 Hero characters vs. 2 each) —
   correct this in the next content batch rather than compounding it.
3. **No active skill is primarily Heal/Buff/Shield** — every support-flavored active skill so far is
   still reflavored offense (debuff/damage). Worth a real support-first active in the next batch.
4. **UI/UX**: the battle scene visuals were reworked into a text-embed + compact decorative canvas
   split, and `/battle` is now startable via a button from `/main` instead of only a typed command —
   see `GAME-MECHANICS-GUIDE.md` §10 and §12. `/duel` still can't be nested the same way since it
   needs a `user` option a select-menu click can't supply.

## 4. Explicitly out of scope for now

Guild system, dungeon system, floor/tower system (`Tower Design` sheet in the GDD), altar commands.
These are documented at brainstorm depth only — headers and a couple of example rows, not full specs —
and each is a multi-week system on its own. Don't start any of them until the PvP core loop has been
in front of real users and you know whether people actually stick around long enough to want a PvE
progression layer. When you do pick one back up, **Tower** is the natural next system (it reuses the
existing `Character`/`Team` battle math against AI-controlled enemies instead of building new
mechanics), and it directly serves retention the way daily free summons and weekly series rotation
already do.

## 5. Open design debt (from your own notes, still unresolved)

- `game-design/duel-feature-notes.txt`: *"fix skill schema database, use ref for efficiency"* — flagged
  by you as a real implementation problem, still open in the current `SkillModel`/`CharacterModel`
  relationship.
- `game-design/passive-skill-notes.txt` has a rougher, informal numbers scratchpad (2%/5% deltas per
  rarity step) that doesn't fully match the finished per-skill tables in the GDD's Skill Design sheet.
  Treat the GDD sheet as canonical; the passive-skill notes file is superseded scratch work, not a
  second source of truth.
- The debuff/buff catalog (Freeze, Sleep, Paralysis, Burn, Bleed, Poison, Frostbite, Silence,
  Blindness, Slow, Weaken, Armor Break, Time Bomb / Strengthen, Critical Boost, Double Attack, Haste,
  Protection, Shield, Aegis) is fully specified with numbers in the GDD but worth auditing against
  `src/classes/Character.ts`'s actual `status` handling to confirm which of these are live in duels
  versus still spec-only.

## 6. Where everything now lives

```
design-docs/
├── GAME-DESIGN-PLAN.md          this file
├── game-design/                 the real Anitopia design docs (GDD, concept, dev guide, skill/duel notes)
├── art/                         illustrations, mockups, .clip/.psd source files
├── external-reference/          AniGame research + HEROCORD screenshots — comparison material, not your content
├── dev-notes/                   implementation todos and dead code scratch
└── archive/                     superseded assets (old pixel-cat logo)
```

Two files were deleted outright rather than archived: `Anitopia Key.txt` and
`compass-connections.json` contained a live Discord bot token, client secret, and MongoDB Atlas
password in plaintext. Confirmed the Client ID in that file matched the bot currently configured in
`.env` before deleting — this was not an old/abandoned credential set.
