import SkillModel from "./models/Skill";

export const charactersData = [
    {
        "name": 'Kirito',
        "fullname": 'Kirigaya Kazuto',
        "series": 'Sword Art Online',
        "element": 'Neutralis',
        "class": 'Warrior',
        "attributes": {
            "health": 78,
            "attack": 82,
            "defense": 71,
            "speed": 80,
        },
        "activeSkill": {
            "name": 'Dual Wielding',
            "descriptions": {
                "Common": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by 30% and his speed by 50% for 3 turns.",
                "Uncommon": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by 35% and his speed by 55% for 3 turns.",
                "Rare": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by 40% and his speed by 60% for 3 turns.",
                "Epic": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by 45% and his speed by 65% for 3 turns.",
                "Legendary": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by 50% and his speed by 70% for 3 turns."
            },
            "baseName": "Resilience Boost" 
        },
        "passiveSkill": {
            "name": 'Starbust Stream',
            "descriptions": {
                "Common": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing 150% true damage of Kirito's attack.",
                "Uncommon": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing 155% true damage of Kirito's attack.",
                "Rare": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing 160% true damage of Kirito's attack.",
                "Epic": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing 165% true damage of Kirito's attack.",
                "Legendary": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing 170% true damage of Kirito's attack."
            },
            "baseName": "True Damage Strike"
        }
    },
    {
        "name": 'Yuno',
        "fullname": 'Yuno Grinberryall',
        "series": 'Black Clover',
        "element": 'Aero',
        "class": 'Mage',
        "attributes": {
            "health": 68,
            "attack": 94,
            "defense": 61,
            "speed": 86,
        },
        "activeSkill": {
            "name": 'Spirit Dive',
            "descriptions": {
                "Common": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by 30% and his speed by 50% for 3 turns.",
                "Uncommon": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by 35% and his speed by 55% for 3 turns.",
                "Rare": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by 40% and his speed by 60% for 3 turns.",
                "Epic": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by 45% and his speed by 65% for 3 turns.",
                "Legendary": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by 50% and his speed by 70% for 3 turns."
            },
            "baseName": "Resilience Boost" 
        },
        "passiveSkill": {
            "name": 'Spirit Storm',
            "descriptions": {
                "Common": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals 105% aero damage to all enemies.",
                "Uncommon": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals 110% aero damage to all enemies.",
                "Rare": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals 115% aero damage to all enemies.",
                "Epic": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals 120% aero damage to all enemies.",
                "Legendary": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals 125% aero damage to all enemies."
            },
            "baseName": "Elemental Burst"
        }
    }
];
