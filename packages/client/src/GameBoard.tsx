import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { hexToArray } from "@latticexyz/utils";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity, Has, getComponentValueStrict } from "@latticexyz/recs";
import { EncounterScreen } from "./EncounterScreen";
import { MonsterType, monsterTypes } from "./monsterTypes";
import { useEffect, useState } from "react";
import { useHappyChain } from "@happychain/react";

export const GameBoard = () => {
  const [playerEntity, setPlayerEntity] = useState<Entity | undefined>(
    undefined
  );
  useKeyboardMovement();

  const {
    game,
    createdApi,
  } = useMUD();

  const {
    gameComponents: { Encounter, MapConfig, Monster, Player, Position },
  } = game;

  const { user } = useHappyChain();

  useEffect(() => {
    if (user && createdApi) {
      setPlayerEntity(createdApi.playerEntity);
    }
  }, [createdApi, user]);

  const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;

  const players = useEntityQuery([Has(Player), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: entity === playerEntity ? "🤠" : "🥸",
    };
  });

  const mapConfig = useComponentValue(MapConfig, singletonEntity);

  const encounter = useComponentValue(Encounter, playerEntity);
  const monsterType = useComponentValue(
    Monster,
    encounter?.monster as Entity
  )?.value;

  const monster = monsterType
    ? monsterTypes[monsterType as MonsterType]
    : undefined;

  // Ensure that the map config is fully loaded before rendering the GameMap
  if (!mapConfig) {
    return <div>Loading...</div>;
  }

  const { width, height, terrain: terrainData } = mapConfig;
  const terrain = Array.from(hexToArray(terrainData)).map((value, index) => {
    const { emoji } =
      value in TerrainType ? terrainTypes[value as TerrainType] : { emoji: "" };
    return {
      x: index % width,
      y: Math.floor(index / width),
      emoji,
    };
  });

  return (
    <GameMap
      width={width}
      height={height}
      terrain={terrain}
      onTileClick={canSpawn ? createdApi?.spawn : undefined}
      players={players}
      encounter={
        encounter && monster ? (
          <EncounterScreen
            monsterName={monster.name ?? "MissingNo"}
            monsterEmoji={monster.emoji ?? "💱"}
          />
        ) : undefined
      }
    />
  );
};
