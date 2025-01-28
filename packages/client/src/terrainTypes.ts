export enum TerrainType {
    TallGrass = 1,
    Boulder = 2,
}

type TerrainConfig = {
    emoji: string
}

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
    [TerrainType.TallGrass]: {
        emoji: "🌳",
    },
    [TerrainType.Boulder]: {
        emoji: "🪨",
    },
}
