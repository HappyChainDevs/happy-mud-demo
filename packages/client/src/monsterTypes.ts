export enum MonsterType {
    Eagle = 1,
    Rat = 2,
    Caterpillar = 3,
}

type MonsterConfig = {
    name: string
    emoji: string
}

export const monsterTypes: Record<MonsterType, MonsterConfig> = {
    [MonsterType.Eagle]: {
        name: "Eagle",
        emoji: "🦅",
    },
    [MonsterType.Rat]: {
        name: "Rat",
        emoji: "🐀",
    },
    [MonsterType.Caterpillar]: {
        name: "Caterpillar",
        emoji: "🐛",
    },
}
