import { WalletClient } from "viem";
import { Network } from "./createNetwork";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { getComponentValue, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Direction } from "../../direction";
import { uuid } from "@latticexyz/utils";
import { OverridableGameComponents } from "./createGameComponents";
import { MonsterCatchResult } from "../../monsterCatchResult";

export type Api = Awaited<ReturnType<typeof createApi>>;

/**
 * equivalent to `src/mud/createSystemCalls`
 */
export const createApi = async (
  components: OverridableGameComponents,
  walletClient?: WalletClient,
  network?: Network
) => {
  if (!walletClient || !walletClient.account) {
    throw new Error("[Create API] Wallet client is not set");
    return;
  }
  if (!network) {
    throw new Error("[Create API] Network is not set");
  }

  const { waitForTransaction, getWalletClientInjectedWorldContract } = network;
  const world = await getWalletClientInjectedWorldContract(walletClient);

  const playerEntity = encodeEntity(
    { address: "address" },
    { address: walletClient.account.address }
  );

  const {
    Encounter,
    MapConfig,
    MonsterCatchAttempt,
    Obstruction,
    Player,
    Position,
  } = components;

  const wrapPosition = (x: number, y: number) => {
    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error("mapConfig no yet loaded or initialized");
    }
    return [
      (x + mapConfig.width) % mapConfig.width,
      (y + mapConfig.height) % mapConfig.height,
    ];
  };

  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const options = {
    chain: network.networkConfig.chain,
    account: walletClient.account!,
    gas: 1_000_000n,
  };

  const move = async (direction: Direction) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const position = getComponentValue(Position, playerEntity);
    if (!position) {
      console.warn("cannot move without a player position, not yet spawned?");
      return;
    }

    const inEncounter = !!getComponentValue(Encounter, playerEntity);
    if (inEncounter) {
      console.warn("cannot move while in encounter");
      return;
    }

    let { x: inputX, y: inputY } = position;
    if (direction === Direction.North) {
      inputY -= 1;
    } else if (direction === Direction.East) {
      inputX += 1;
    } else if (direction === Direction.South) {
      inputY += 1;
    } else if (direction === Direction.West) {
      inputX -= 1;
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot move to obstructed space");
      return;
    }

    const positionId = uuid();
    // roll in overridable components into network object
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await world.write.move([direction], options);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const spawn = async (inputX: number, inputY: number) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot spawn on obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await world.write.spawn([x, y], options);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
    }
  };

  const throwBall = async () => {
    const player = playerEntity;
    if (!player) {
      throw new Error("no player");
    }

    const encounter = getComponentValue(Encounter, player);
    if (!encounter) {
      throw new Error("no encounter");
    }

    const tx = await world.write.throwBall(options);
    await waitForTransaction(tx);

    const catchAttempt = getComponentValue(MonsterCatchAttempt, player);
    if (!catchAttempt) {
      throw new Error("no catch attempt found");
    }

    return catchAttempt.result as MonsterCatchResult;
  };

  const fleeEncounter = async () => {
    const tx = await world.write.flee(options);
    await waitForTransaction(tx);
  };

  return {
    playerEntity,
    move,
    spawn,
    throwBall,
    fleeEncounter,
  };
};
