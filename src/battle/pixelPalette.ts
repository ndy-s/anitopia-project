// Shared retro palette for every pixel-art asset — battle scene chrome, generated icons. Keeping this
// in one module is what keeps the icon generator and the battle scene renderer visually consistent.

export const PIXEL = {
    bg1: '#14101f',
    bg2: '#0c0916',
    panel: '#241d38',
    panelLight: '#3a3059',
    border: '#000000',
    gold: '#f0d38c',
    bone: '#ddd4c4',
    boneDim: '#8f8a9c',
    ember: '#e0685c',
    verdigris: '#6ea18e',
    amber: '#d4a72c',
    skillCyan: '#6fd8e8',
    passiveViolet: '#a978d6',
    grass: '#2f5c2b',
    grassLight: '#3f7a34',
};

export const RARITY_COLOR: Record<number, string> = {
    1: '#f0d38c', // Legendary
    2: '#a978d6', // Epic
    3: '#5b9ccf', // Rare
    4: '#6ea18e', // Uncommon
    5: '#a89f8f', // Common
};

export const RARITY_STAR_COUNT: Record<number, number> = {
    1: 5, // Legendary
    2: 4, // Epic
    3: 3, // Rare
    4: 2, // Uncommon
    5: 1, // Common
};

export interface ElementPalette {
    fill: string;
    shade: string;
}

export const ELEMENT_COLOR: Record<string, ElementPalette> = {
    pyro: { fill: '#ff6a3c', shade: '#b8341c' },
    aqua: { fill: '#4fc3ff', shade: '#1a6fa8' },
    volt: { fill: '#ffe066', shade: '#c9a412' },
    terra: { fill: '#7bc96f', shade: '#3f7a34' },
    aero: { fill: '#9ff2d8', shade: '#3f9c82' },
    lumen: { fill: '#fff3c4', shade: '#d9b954' },
    shade: { fill: '#a97bf0', shade: '#5a3499' },
    neutralis: { fill: '#c7c7d9', shade: '#6a6a80' },
};

// Deliberately distinct hues from ELEMENT_COLOR (even where a class and element land in the same
// rough color family, e.g. Warrior red vs Pyro orange) so a class+element icon pair never reads as
// two copies of the same icon at a glance.
export const CLASS_COLOR: Record<string, ElementPalette> = {
    warrior: { fill: '#d64545', shade: '#8a2020' },
    mage: { fill: '#7c5cff', shade: '#4527a8' },
    tank: { fill: '#8a94a8', shade: '#4a5266' },
    hunter: { fill: '#c9a227', shade: '#7a5f10' },
    support: { fill: '#5cc9a7', shade: '#2c7a63' },
};
