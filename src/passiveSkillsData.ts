export const passiveSkillsData = [
    {
        "name": "Battlefield Roar",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Battle Start",
        "target": "Area",
        "descriptionTemplate": "At the start of each battle, your team's attack increases by {v1}%.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.2,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.25,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.3,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.35,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.4,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            }
        }
    },
    {
        "name": "Guardian's Blessing",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Each Turn",
        "target": "Lowest Health",
        "descriptionTemplate": "Each turn, your character has a {c1}% chance to provide a protective shield to the ally with the lowest health, reducing the damage they take by {v1}% for {d1} turn(s).",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.15,
                        "chance": 0.22,
                        "duration": 1,
                        "target": "Ally"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.2,
                        "chance": 0.24,
                        "duration": 1,
                        "target": "Ally"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.25,
                        "chance": 0.26,
                        "duration": 1,
                        "target": "Ally"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.3,
                        "chance": 0.28,
                        "duration": 1,
                        "target": "Ally"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.35,
                        "chance": 0.3,
                        "duration": 1,
                        "target": "Ally"
                    }
                ]
            }
        }
    },
    {
        "name": "Healing Touch",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Each Turn",
        "target": "Lowest Health",
        "descriptionTemplate": "Each turn, your character has a {c1}% chance to heal one ally with the lowest health. The healing effect restores {v1}% of the ally's maximum health.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Heal",
                        "attribute": "Health",
                        "value": 0.05,
                        "chance": 0.22,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Heal",
                        "attribute": "Health",
                        "value": 0.08,
                        "chance": 0.24,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Heal",
                        "attribute": "Health",
                        "value": 0.11,
                        "chance": 0.26,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Heal",
                        "attribute": "Health",
                        "value": 0.14,
                        "chance": 0.28,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Heal",
                        "attribute": "Health",
                        "value": 0.18,
                        "chance": 0.3,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            }
        }
    },
    {
        "name": "Resilience Boost",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Health -50%",
        "target": "Single",
        "descriptionTemplate": "When your character's health drops below 50%, your character's attack increases by {v1}% and speed increases by {v2}% for {d1} turns.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.3,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    },
                    {
                        "type": "Buff",
                        "attribute": "Speed",
                        "value": 0.5,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.35,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    },
                    {
                        "type": "Buff",
                        "attribute": "Speed",
                        "value": 0.55,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.4,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    },
                    {
                        "type": "Buff",
                        "attribute": "Speed",
                        "value": 0.6,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.45,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    },
                    {
                        "type": "Buff",
                        "attribute": "Speed",
                        "value": 0.65,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff",
                        "attribute": "Attack",
                        "value": 0.5,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    },
                    {
                        "type": "Buff",
                        "attribute": "Speed",
                        "value": 0.7,
                        "chance": 1,
                        "duration": 3,
                        "target": "Ally"
                    }
                ]
            }
        }
    },
    {
        "name": "Fortitude",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Damage Taken",
        "target": "Single",
        "descriptionTemplate": "This skill reduces the damage taken by {v1}% whenever you are hit.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.05,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.1,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.15,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.2,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Shield",
                        "attribute": "Damage",
                        "value": 0.25,
                        "chance": 1,
                        "duration": 0,
                        "target": "Ally"
                    }
                ]
            }
        }
    },
    {
        "name": "Bleeding Strike",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Attack",
        "target": "Single",
        "descriptionTemplate": "This skill gives your character's attacks a {c1}% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose {v1}% of their maximum health over {d1} turns.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Bleed",
                        "attribute": "Maximum Health",
                        "value": 0.05,
                        "chance": 0.1,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ]
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Bleed",
                        "attribute": "Maximum Health",
                        "value": 0.05,
                        "chance": 0.15,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ]
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Bleed",
                        "attribute": "Maximum Health",
                        "value": 0.05,
                        "chance": 0.2,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ]
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Bleed",
                        "attribute": "Maximum Health",
                        "value": 0.05,
                        "chance": 0.25,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ]
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Bleed",
                        "attribute": "Maximum Health",
                        "value": 0.05,
                        "chance": 0.3,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ]
            }
        }
    },
    {
        "name": "Second Wind",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Health -25%",
        "target": "Single",
        "descriptionTemplate": "When your character's health drops below 25%, your character's attack increases by {v1}% and speed increases by {v2}% for {d1} turns.",
        "rarityEffects": {
            "Common": {
                "effects": [
                    { "type": "Buff", "attribute": "Attack", "value": 0.35, "chance": 1, "duration": 3, "target": "Ally" },
                    { "type": "Buff", "attribute": "Speed", "value": 0.55, "chance": 1, "duration": 3, "target": "Ally" }
                ]
            },
            "Uncommon": {
                "effects": [
                    { "type": "Buff", "attribute": "Attack", "value": 0.4, "chance": 1, "duration": 3, "target": "Ally" },
                    { "type": "Buff", "attribute": "Speed", "value": 0.6, "chance": 1, "duration": 3, "target": "Ally" }
                ]
            },
            "Rare": {
                "effects": [
                    { "type": "Buff", "attribute": "Attack", "value": 0.45, "chance": 1, "duration": 3, "target": "Ally" },
                    { "type": "Buff", "attribute": "Speed", "value": 0.65, "chance": 1, "duration": 3, "target": "Ally" }
                ]
            },
            "Epic": {
                "effects": [
                    { "type": "Buff", "attribute": "Attack", "value": 0.5, "chance": 1, "duration": 3, "target": "Ally" },
                    { "type": "Buff", "attribute": "Speed", "value": 0.7, "chance": 1, "duration": 3, "target": "Ally" }
                ]
            },
            "Legendary": {
                "effects": [
                    { "type": "Buff", "attribute": "Attack", "value": 0.55, "chance": 1, "duration": 3, "target": "Ally" },
                    { "type": "Buff", "attribute": "Speed", "value": 0.75, "chance": 1, "duration": 3, "target": "Ally" }
                ]
            }
        }
    },
    {
        "name": "Lifesteal",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Attack",
        "target": "Single",
        "descriptionTemplate": "Your character's attacks have a {c1}% chance to drain the target's vitality, healing your character for {v1}% of their max health.",
        "rarityEffects": {
            "Common": { "effects": [{ "type": "Heal", "attribute": "Health", "value": 0.08, "chance": 0.25, "duration": 0, "target": "Ally" }] },
            "Uncommon": { "effects": [{ "type": "Heal", "attribute": "Health", "value": 0.1, "chance": 0.28, "duration": 0, "target": "Ally" }] },
            "Rare": { "effects": [{ "type": "Heal", "attribute": "Health", "value": 0.12, "chance": 0.31, "duration": 0, "target": "Ally" }] },
            "Epic": { "effects": [{ "type": "Heal", "attribute": "Health", "value": 0.14, "chance": 0.34, "duration": 0, "target": "Ally" }] },
            "Legendary": { "effects": [{ "type": "Heal", "attribute": "Health", "value": 0.16, "chance": 0.38, "duration": 0, "target": "Ally" }] }
        }
    },
    {
        "name": "Corrosive Touch",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Attack",
        "target": "Single",
        "descriptionTemplate": "Your character's attacks have a {c1}% chance to poison the enemy, dealing {v1}% of their max health as damage over {d1} turns.",
        "rarityEffects": {
            "Common": { "effects": [{ "type": "Poison", "attribute": "Maximum Health", "value": 0.05, "chance": 0.3, "duration": 2, "target": "Enemy" }] },
            "Uncommon": { "effects": [{ "type": "Poison", "attribute": "Maximum Health", "value": 0.05, "chance": 0.33, "duration": 2, "target": "Enemy" }] },
            "Rare": { "effects": [{ "type": "Poison", "attribute": "Maximum Health", "value": 0.05, "chance": 0.36, "duration": 2, "target": "Enemy" }] },
            "Epic": { "effects": [{ "type": "Poison", "attribute": "Maximum Health", "value": 0.05, "chance": 0.39, "duration": 2, "target": "Enemy" }] },
            "Legendary": { "effects": [{ "type": "Poison", "attribute": "Maximum Health", "value": 0.05, "chance": 0.42, "duration": 2, "target": "Enemy" }] }
        }
    }
];
