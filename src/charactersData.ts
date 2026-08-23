export const charactersData = [
    {
        "name": 'Kirito',
        "fullname": 'Kirigaya Kazuto',
        "series": 'Sword Art Online',
        "element": 'Neutralis',
        "class": 'Warrior',
        "role": 'Hero',
        "attributes": {
            "health": 78,
            "attack": 82,
            "defense": 71,
            "speed": 80,
        },
        "passiveSkill": {
            "name": 'Dual Wielding',
            "flavorTemplate": "When Kirito's health drops below 50%, he activates his Dual Wielding skill. This increases his attack by {v1}% and his speed by {v2}% for {d1} turns.",
            "skillRef": "Resilience Boost"
        },
        "activeSkill": {
            "name": 'Starbust Stream',
            "flavorTemplate": "Kirito unleashes a rapid 16-hit combo that targets a single enemy. The skill dealing {v1}% true damage of Kirito's attack.",
            "skillRef": "True Damage Strike"
        },
        "quotes": "I may be a solo player, but in this virtual world I feel more alive than ever."
    },
    {
        "name": 'Yuno',
        "fullname": 'Yuno Grinberryall',
        "series": 'Black Clover',
        "element": 'Aero',
        "class": 'Mage',
        "role": 'Hero',
        "attributes": {
            "health": 68,
            "attack": 94,
            "defense": 61,
            "speed": 86,
        },
        "passiveSkill": {
            "name": 'Spirit Dive',
            "flavorTemplate": "When Yuno's health drops below 50%, he enters Spirit Dive mode, increasing his attack by {v1}% and his speed by {v2}% for {d1} turns.",
            "skillRef": "Resilience Boost"
        },
        "activeSkill": {
            "name": 'Spirit Storm',
            "flavorTemplate": "Yuno uses his aero powers to create a strong wind that hits all enemies. This skill deals {v1}% aero damage to all enemies.",
            "skillRef": "Elemental Burst"
        },
        "quotes": "Once you elites trip up, you're so weak."
    },
    {
        "name": 'All Might',
        "fullname": 'Toshinori Yagi',
        "series": 'My Hero Academia',
        "element": 'Neutralis',
        "class": 'Tank',
        "role": 'Hero',
        "attributes": {
            "health": 91,
            "attack": 70,
            "defense": 94,
            "speed": 62,
        },
        "passiveSkill": {
            "name": 'One For All',
            "flavorTemplate": "All Might's One For All reduces damage taken by {v1}%.",
            "skillRef": "Fortitude"
        },
        "activeSkill": {
            "name": 'United State of Smash',
            "flavorTemplate": "All Might delivers a powerful punch to a single enemy, dealing {v1}% true damage of All Might's attack.",
            "skillRef": "True Damage Strike"
        },
        "quotes": "It's fine now. Why? Because I am here!"
    },
    {
        "name": 'Mikasa',
        "fullname": 'Mikasa Ackerman',
        "series": 'Attack on Titan',
        "element": 'Neutralis',
        "class": 'Hunter',
        "role": 'Hero',
        "attributes": {
            "health": 73,
            "attack": 87,
            "defense": 71,
            "speed": 93,
        },
        "passiveSkill": {
            "name": 'Ackerman Instincts',
            "flavorTemplate": "Mikasa's attacks have a {c1}% chance to inflict the bleed status on enemies. Enemies affected by bleed lose {v1}% of their max health for {d1} turns.",
            "skillRef": "Bleeding Strike"
        },
        "activeSkill": {
            "name": 'Blade Frenzy',
            "flavorTemplate": "Mikasa unleashes a flurry of attacks with her dual blades on all enemies, dealing {v1}% true damage of Mikasa's attack.",
            "skillRef": "True Damage Burst"
        },
        "quotes": "What's the point in worrying about your fate? Choose it yourself."
    },
    {
        "name": 'Roy Mustang',
        "fullname": 'Roy Mustang',
        "series": 'Fullmetal Alchemist',
        "element": 'Pyro',
        "class": 'Mage',
        "role": 'Hero',
        "attributes": {
            "health": 65,
            "attack": 96,
            "defense": 58,
            "speed": 75,
        },
        "passiveSkill": {
            "name": "State Alchemist's Command",
            "flavorTemplate": "At the start of the battle, Roy commands his squad with the authority of a State Alchemist, increasing the whole team's attack by {v1}%.",
            "skillRef": "Battlefield Roar"
        },
        "activeSkill": {
            "name": 'Flame Alchemy: Snap',
            "flavorTemplate": "Roy snaps his fingers, igniting a corona of flame around a single enemy and dealing {v1}% pyro damage.",
            "skillRef": "Elemental Strike"
        },
        "quotes": "I'm going to change this country, even if it kills me."
    },
    {
        "name": 'Nami',
        "fullname": 'Nami',
        "series": 'One Piece',
        "element": 'Aqua',
        "class": 'Support',
        "role": 'Hero',
        "attributes": {
            "health": 74,
            "attack": 63,
            "defense": 68,
            "speed": 78,
        },
        "passiveSkill": {
            "name": "Navigator's Watch",
            "flavorTemplate": "Each turn, Nami has a {c1}% chance to patch up the ally with the lowest health, restoring {v1}% of their max health.",
            "skillRef": "Healing Touch"
        },
        "activeSkill": {
            "name": 'Mirage Tempo',
            "flavorTemplate": "Nami spins her Clima-Tact into Mirage Tempo, wrapping the battlefield in a disorienting weather-warped fog and reducing all enemies' accuracy by {v1}% for {d1} turns.",
            "skillRef": "Blind Fog"
        },
        "quotes": "This is my dream, and no one is going to stand in my way!"
    },
    {
        "name": 'Killua',
        "fullname": 'Killua Zoldyck',
        "series": 'Hunter x Hunter',
        "element": 'Volt',
        "class": 'Hunter',
        "role": 'Hero',
        "attributes": {
            "health": 70,
            "attack": 89,
            "defense": 65,
            "speed": 97,
        },
        "passiveSkill": {
            "name": "Thunderbolt's Afterimage",
            "flavorTemplate": "Killua moves faster than the eye can follow, and his attacks have a {c1}% chance to leave enemies reeling from lingering shock damage, dealing {v1}% of their max health over {d1} turns.",
            "skillRef": "Bleeding Strike"
        },
        "activeSkill": {
            "name": 'Lightning Palm',
            "flavorTemplate": "Killua unleashes his Lightning Palm, arcing volt damage through the entire enemy team for {v1}% damage.",
            "skillRef": "Elemental Burst"
        },
        "quotes": "I've decided. From now on, I'm going to do everything my way."
    },
    {
        "name": 'Gaara',
        "fullname": 'Gaara',
        "series": 'Naruto',
        "element": 'Terra',
        "class": 'Tank',
        "role": 'Hero',
        "attributes": {
            "health": 95,
            "attack": 68,
            "defense": 96,
            "speed": 58,
        },
        "passiveSkill": {
            "name": 'Sand Armor',
            "flavorTemplate": "Gaara's Sand Armor instinctively hardens on impact, reducing all damage he takes by {v1}%.",
            "skillRef": "Fortitude"
        },
        "activeSkill": {
            "name": 'Desert Funeral',
            "flavorTemplate": "Gaara entombs a single enemy in crushing sand with Desert Funeral, dealing {v1}% true damage of his attack.",
            "skillRef": "True Damage Strike"
        },
        "quotes": "Those who forgive themselves, and are able to accept their true weaknesses... they are the strong ones."
    },
    {
        "name": 'Yoruichi',
        "fullname": 'Yoruichi Shihouin',
        "series": 'Bleach',
        "element": 'Shade',
        "class": 'Warrior',
        "role": 'Hero',
        "attributes": {
            "health": 76,
            "attack": 90,
            "defense": 74,
            "speed": 91,
        },
        "passiveSkill": {
            "name": 'Shunkō Awakening',
            "flavorTemplate": "When Yoruichi's health drops below 50%, she unleashes Shunkō, increasing her attack by {v1}% and her speed by {v2}% for {d1} turns.",
            "skillRef": "Resilience Boost"
        },
        "activeSkill": {
            "name": "Flash Goddess's Onslaught",
            "flavorTemplate": "Moving faster than the eye can follow, Yoruichi strikes every enemy in an instant, dealing {v1}% true damage of her attack to all enemies.",
            "skillRef": "True Damage Burst"
        },
        "quotes": "I am the Goddess of Flash, remember?"
    },
    {
        "name": 'Orihime',
        "fullname": 'Inoue Orihime',
        "series": 'Bleach',
        "element": 'Lumen',
        "class": 'Support',
        "role": 'Hero',
        "attributes": {
            "health": 72,
            "attack": 58,
            "defense": 63,
            "speed": 72,
        },
        "passiveSkill": {
            "name": 'Santen Kesshun',
            "flavorTemplate": "Each turn, Orihime has a {c1}% chance to summon her fairies' Santen Kesshun, shielding the ally with the lowest health and reducing the damage they take by {v1}% for {d1} turn(s).",
            "skillRef": "Guardian's Blessing"
        },
        "activeSkill": {
            "name": 'Koten Zanshun',
            "flavorTemplate": "Orihime calls upon Tsubaki with a cry of \"I reject!\", striking a single enemy with radiant force in Koten Zanshun for {v1}% lumen damage.",
            "skillRef": "Elemental Strike"
        },
        "quotes": "I won't run away anymore. I'll face whatever comes."
    },
    {
        "name": 'Momo Yaoyorozu',
        "fullname": 'Momo Yaoyorozu',
        "series": 'My Hero Academia',
        "element": 'Neutralis',
        "class": 'Support',
        "role": 'Hero',
        "attributes": {
            "health": 73,
            "attack": 75,
            "defense": 68,
            "speed": 87,
        },
        "passiveSkill": {
            "name": 'Quick Creation',
            "flavorTemplate": "Each turn, Momo has a {c1}% chance to quickly create a barrier for the ally with the lowest health, reducing the damage they take by {v1}% for {d1} turn(s).",
            "skillRef": "Guardian's Blessing"
        },
        "activeSkill": {
            "name": 'Flash Bang Grenade',
            "flavorTemplate": "Momo creates a Flash Bang Grenade and throws it at the enemy team, reducing their accuracy by {v1}% for {d1} turns.",
            "skillRef": "Blind Fog"
        },
        "quotes": "I am capable of much more than this!"
    },
    {
        "name": 'Rem',
        "fullname": 'Rem',
        "series": 'Re:Zero',
        "element": 'Aqua',
        "class": 'Support',
        "role": 'Hero',
        "attributes": {
            "health": 76,
            "attack": 68,
            "defense": 74,
            "speed": 84,
        },
        "passiveSkill": {
            "name": 'Oni Bloodline',
            "flavorTemplate": "Each turn, Rem's Oni Bloodline gives her a {c1}% chance to heal the ally with the lowest health, restoring {v1}% of their max health.",
            "skillRef": "Healing Touch"
        },
        "activeSkill": {
            "name": 'Morningstar',
            "flavorTemplate": "Rem swings her spiked Morningstar at a single enemy, dealing {v1}% true damage of her attack.",
            "skillRef": "True Damage Strike"
        },
        "quotes": "I don't need a reason to love you."
    },
    {
        "name": 'Naruto',
        "fullname": 'Naruto Uzumaki',
        "series": 'Naruto',
        "element": 'Aero',
        "class": 'Warrior',
        "role": 'Hero',
        "attributes": {
            "health": 80,
            "attack": 88,
            "defense": 74,
            "speed": 82,
        },
        "passiveSkill": {
            "name": 'Nine-Tails Chakra Mode',
            "flavorTemplate": "When Naruto's health drops below 25%, the Nine-Tails' chakra surges through him, increasing his attack by {v1}% and his speed by {v2}% for {d1} turns.",
            "skillRef": "Second Wind"
        },
        "activeSkill": {
            "name": 'Rasengan',
            "flavorTemplate": "Naruto slams a spiraling Rasengan into a single enemy, dealing {v1}% damage with a {c2}% chance to leave them reeling and paralyzed for {d2} turns.",
            "skillRef": "Stunning Blow"
        },
        "quotes": "Believe it! I'm not gonna run away, I never go back on my word!"
    },
    {
        "name": 'Megumin',
        "fullname": 'Megumin',
        "series": 'KonoSuba',
        "element": 'Pyro',
        "class": 'Mage',
        "role": 'Hero',
        "attributes": {
            "health": 62,
            "attack": 98,
            "defense": 55,
            "speed": 79,
        },
        "passiveSkill": {
            "name": 'Crimson Affinity',
            "flavorTemplate": "At the start of the battle, Megumin's crimson demon pride ignites her party's fighting spirit, increasing the whole team's attack by {v1}%.",
            "skillRef": "Battlefield Roar"
        },
        "activeSkill": {
            "name": 'Explosion',
            "flavorTemplate": "Megumin channels every last drop of her mana into a single devastating Explosion, dealing {v1}% damage to one enemy with a {c2}% chance to leave them burning for {d2} turns.",
            "skillRef": "Explosive Strike"
        },
        "quotes": "My name is Megumin, the number one Arch Wizard of the Crimson Demon Clan!"
    },
    {
        "name": 'Himiko Toga',
        "fullname": 'Himiko Toga',
        "series": 'My Hero Academia',
        "element": 'Shade',
        "class": 'Hunter',
        "role": 'Hero',
        "attributes": {
            "health": 68,
            "attack": 85,
            "defense": 62,
            "speed": 95,
        },
        "passiveSkill": {
            "name": 'Bloodsucker',
            "flavorTemplate": "Himiko's attacks have a {c1}% chance to drain her target's blood, healing her for {v1}% of her max health.",
            "skillRef": "Lifesteal"
        },
        "activeSkill": {
            "name": 'Chilling Whisper',
            "flavorTemplate": "Himiko slips a blade past her target's guard with an unsettling whisper, dealing {v1}% damage with a {c2}% chance to silence them for {d2} turns.",
            "skillRef": "Silencing Strike"
        },
        "quotes": "I just want to be loved for who I really am."
    },
    {
        "name": 'Ken Kaneki',
        "fullname": 'Ken Kaneki',
        "series": 'Tokyo Ghoul',
        "element": 'Shade',
        "class": 'Warrior',
        "role": 'Hero',
        "attributes": {
            "health": 82,
            "attack": 91,
            "defense": 76,
            "speed": 79,
        },
        "passiveSkill": {
            "name": 'Ghoul Physiology',
            "flavorTemplate": "Kaneki's ghoul physiology lets his attacks have a {c1}% chance to drain his target's vitality, healing him for {v1}% of his max health.",
            "skillRef": "Lifesteal"
        },
        "activeSkill": {
            "name": 'Kagune Awakening',
            "flavorTemplate": "Kaneki's kagune tears free, boosting his attack by {v1}% and defense by {v2}% for {d1} turns.",
            "skillRef": "Boost Strike"
        },
        "quotes": "I'm not the kind of guy who does something because everyone else does."
    },
    {
        "name": 'Rimuru Tempest',
        "fullname": 'Rimuru Tempest',
        "series": 'That Time I Got Reincarnated as a Slime',
        "element": 'Aqua',
        "class": 'Mage',
        "role": 'Hero',
        "attributes": {
            "health": 70,
            "attack": 93,
            "defense": 60,
            "speed": 81,
        },
        "passiveSkill": {
            "name": 'Predator',
            "flavorTemplate": "Rimuru's Predator skill gives his attacks a {c1}% chance to corrode the enemy, dealing {v1}% of their max health as damage over {d1} turns.",
            "skillRef": "Corrosive Touch"
        },
        "activeSkill": {
            "name": 'Ice Blade',
            "flavorTemplate": "Rimuru conjures an Ice Blade and strikes a single enemy, dealing {v1}% damage with a {c2}% chance to freeze them solid for {d2} turns.",
            "skillRef": "Freezing Strike"
        },
        "quotes": "Being reborn in another world, I want to live life on my own terms."
    },
    {
        "name": 'Dire Wolf',
        "fullname": 'Dire Wolf',
        "series": 'Sword Art Online',
        "element": 'Terra',
        "class": 'Warrior',
        "role": 'Enemy',
        "attributes": {
            "health": 67,
            "attack": 73,
            "defense": 63,
            "speed": 80,
        },
        "passiveSkill": {
            "name": 'Pack Leader',
            "flavorTemplate": "At the start of the battle, the Dire Wolf howls, rallying its pack and increasing the whole team's attack by {v1}%.",
            "skillRef": "Battlefield Roar"
        },
        "activeSkill": {
            "name": 'Pounce',
            "flavorTemplate": "The Dire Wolf pounces on a single enemy, dealing {v1}% true damage of its attack.",
            "skillRef": "True Damage Strike"
        },
        "quotes": "A low growl rumbles from the treeline."
    },
];
