# Anitopia: Project Instructions

## `design-docs/GAME-MECHANICS-GUIDE.md` is the source of truth for game design

It documents every live system in full detail: character stats & rarity, leveling, the damage formula,
the elemental wheel, all skill effect types, the shared skill-template architecture, class identity
hooks, the full skill catalog (every template + every character's flavor mapping), and summon/pity rates.
It must always match what `src/` actually does; never let it drift in either direction.

- **Changing a game mechanic in code** (a formula, a rarity bonus, a class hook, adding a skill template,
  adding a character, etc.)? Update the relevant section of `GAME-MECHANICS-GUIDE.md` in the same piece of
  work. A mechanics change isn't done until the doc reflects it, don't leave it for later.
- **The user edits the doc directly?** Treat that as a spec change, not a note-to-self. Read the new
  section, work out what changed, and bring the implementation in `src/` in line with it. The doc is not
  just describing the code after the fact, once written, it's the spec the code has to satisfy.
- **Doc and code disagree, and you didn't just cause it mid-edit?** Don't silently pick a side. Flag the
  discrepancy to the user and ask which one is correct before changing either, the doc could be stale, or
  the code could have an undocumented bug.
- Adding a new character or skill template? Update the character-to-skill map, the element/class coverage
  notes, and the full skill catalog table in the same pass, not just the roster count.

`design-docs/GAME-DESIGN-PLAN.md` is different: it's the roadmap and priority reasoning (what to build
next and why), not a live spec of current behavior. Treat it as directional, not something the running
code needs to match today.

Note: `design-docs/` is tracked in git and shipped with the repo, so treat it as part of the project's
documentation, not a private scratch space. That's exactly why it needs to stay accurate: it's the only
place the full picture lives.
