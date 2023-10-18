export const passiveSkillsData = [
    {
        "name": "Battlefield Roar",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Battle Start",
        "target": "Area",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.2,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "At the start of each battle, your team's attack increases by 20%."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.25,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "At the start of each battle, your team's attack increases by 25%."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.3,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "At the start of each battle, your team's attack increases by 30%."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.35,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "At the start of each battle, your team's attack increases by 35%."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.4,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "At the start of each battle, your team's attack increases by 40%."
            }
        }
    },
    {
        "name": "Guardian's Blessing",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Each Turn",
        "target": "Single",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff Shield",
                        "value": 0.15,
                        "chance": 0.22,
                        "duration": 1,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 22% chance to provides a protective shield to the ally with the lowest health, reducing the damage they take by 15% for 1 turn."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff Shield",
                        "value": 0.2,
                        "chance": 0.24,
                        "duration": 1,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 24% chance to provides a protective shield to the ally with the lowest health, reducing the damage they take by 20% for 1 turn."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff Shield",
                        "value": 0.25,
                        "chance": 0.26,
                        "duration": 1,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 26% chance to provides a protective shield to the ally with the lowest health, reducing the damage they take by 25% for 1 turn."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff Shield",
                        "value": 0.3,
                        "chance": 0.28,
                        "duration": 1,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 28% chance to provides a protective shield to the ally with the lowest health, reducing the damage they take by 30% for 1 turn."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff Shield",
                        "value": 0.35,
                        "chance": 0.3,
                        "duration": 1,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 30% chance to provides a protective shield to the ally with the lowest health, reducing the damage they take by 35% for 1 turn."
            }
        }
    },
    {
        "name": "Healing Touch",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Each Turn",
        "target": "Single",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff Heal",
                        "value": 0.05,
                        "chance": 0.22,
                        "duration": 0,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 22% chance to heal one ally with the lowest health. The healing effect restores 5% of the ally's maximum health."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff Heal",
                        "value": 0.08,
                        "chance": 0.24,
                        "duration": 0,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 24% chance to heal one ally with the lowest health. The healing effect restores 8% of the ally's maximum health."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff Heal",
                        "value": 0.11,
                        "chance": 0.26,
                        "duration": 0,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 26% chance to heal one ally with the lowest health. The healing effect restores 11% of the ally's maximum health."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff Heal",
                        "value": 0.14,
                        "chance": 0.28,
                        "duration": 0,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 28% chance to heal one ally with the lowest health. The healing effect restores 14% of the ally's maximum health."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff Heal",
                        "value": 0.18,
                        "chance": 0.3,
                        "duration": 0,
                        "target": "Lowest Health"
                    }
                ],
                "description": "Each turn, your character's has a 30% chance to heal one ally with the lowest health. The healing effect restores 18% of the ally's maximum health."
            }
        }
    },
    {
        "name": "Resilience Boost",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Health -50%",
        "target": "Single",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.3,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    },
                    {
                        "type": "Buff Speed",
                        "value": 0.5,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    }
                ],
                "description": "When your character's health drops below 50%, your character's attack increases by 30% and speed increases by 50% for 3 turns."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.35,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    },
                    {
                        "type": "Buff Speed",
                        "value": 0.55,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    }
                ],
                "description": "When your character's health drops below 50%, your character's attack increases by 35% and speed increases by 55% for 3 turns."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.4,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    },
                    {
                        "type": "Buff Speed",
                        "value": 0.6,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    }
                ],
                "description": "When your character's health drops below 50%, your character's attack increases by 40% and speed increases by 60% for 3 turns."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.45,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    },
                    {
                        "type": "Buff Speed",
                        "value": 0.65,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    }
                ],
                "description": "When your character's health drops below 50%, your character's attack increases by 45% and speed increases by 65% for 3 turns."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Buff Attack",
                        "value": 0.5,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    },
                    {
                        "type": "Buff Speed",
                        "value": 0.7,
                        "chance": 1,
                        "duration": 3,
                        "target": "Self"
                    }
                ],
                "description": "When your character's health drops below 50%, your character's attack increases by 50% and speed increases by 70% for 3 turns."
            }
        }
    },
    {
        "name": "Fortitude",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Damage Taken",
        "target": "Single",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Damage Reduction",
                        "value": 0.05,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "This skill reduces the damage taken by 5% whenever you are hit."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Damage Reduction",
                        "value": 0.1,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "This skill reduces the damage taken by 10% whenever you are hit."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Damage Reduction",
                        "value": 0.15,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "This skill reduces the damage taken by 15% whenever you are hit."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Damage Reduction",
                        "value": 0.2,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "This skill reduces the damage taken by 20% whenever you are hit."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Damage Reduction",
                        "value": 0.25,
                        "chance": 1,
                        "duration": 0,
                        "target": "Self"
                    }
                ],
                "description": "This skill reduces the damage taken by 25% whenever you are hit."
            }
        },
    },
    {
        "name": "Bleeding Strike",
        "type": "Passive",
        "cooldown": null,
        "trigger": "Attack",
        "target": "Single",
        "rarityEffects": {
            "Common": {
                "effects": [
                    {
                        "type": "Debuff Bleed",
                        "value": 0.05,
                        "chance": 0.1,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ],
                "description": "This skill gives your character's attacks a 10% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose 5% of their maximum health over 3 turns."
            },
            "Uncommon": {
                "effects": [
                    {
                        "type": "Debuff Bleed",
                        "value": 0.05,
                        "chance": 0.15,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ],
                "description": "This skill gives your character's attacks a 15% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose 5% of their maximum health over 3 turns."
            },
            "Rare": {
                "effects": [
                    {
                        "type": "Debuff Bleed",
                        "value": 0.05,
                        "chance": 0.2,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ],
                "description": "This skill gives your character's attacks a 20% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose 5% of their maximum health over 3 turns."
            },
            "Epic": {
                "effects": [
                    {
                        "type": "Debuff Bleed",
                        "value": 0.05,
                        "chance": 0.25,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ],
                "description": "This skill gives your character's attacks a 25% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose 5% of their maximum health over 3 turns."
            },
            "Legendary": {
                "effects": [
                    {
                        "type": "Debuff Bleed",
                        "value": 0.05,
                        "chance": 0.3,
                        "duration": 3,
                        "target": "Enemy"
                    }
                ],
                "description": "This skill gives your character's attacks a 30% chance to inflict the Bleed status on enemies. Enemies affected by Bleed lose 5% of their maximum health over 3 turns."
            }
        }
    }
];
