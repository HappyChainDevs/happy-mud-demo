import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs"
import { singletonEntity } from "@latticexyz/store-sync/recs"
import { uuid } from "@latticexyz/utils"
import type { Address } from "viem"
import { Direction } from "../direction"
import type { MonsterCatchResult } from "../monsterCatchResult"
import type { ClientComponents } from "./createClientComponents"
import type { Network, WorldContractWrite } from "./setupNetwork"

import { requestSessionKey } from "@happychain/js"
import { networkConfig } from "./networkConfig"

export type SystemCalls = ReturnType<typeof createSystemCalls>

export function createSystemCalls(
    { playerEntity, worldContract: _worldContract, waitForTransaction }: Network,
    { Encounter, MapConfig, MonsterCatchAttempt, Obstruction, Player, Position }: ClientComponents,
) {
    const worldContract = _worldContract as WorldContractWrite

    const wrapPosition = (x: number, y: number) => {
        const mapConfig = getComponentValue(MapConfig, singletonEntity)
        if (!mapConfig) {
            throw new Error("mapConfig no yet loaded or initialized")
        }
        return [(x + mapConfig.width) % mapConfig.width, (y + mapConfig.height) % mapConfig.height]
    }

    const isObstructed = (x: number, y: number) => {
        return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0
    }

    const move = async (direction: Direction) => {
        if (!playerEntity) {
            throw new Error("no player")
        }

        const position = getComponentValue(Position, playerEntity)
        if (!position) {
            console.warn("cannot move without a player position, not yet spawned?")
            return
        }

        const inEncounter = !!getComponentValue(Encounter, playerEntity)
        if (inEncounter) {
            console.warn("cannot move while in encounter")
            return
        }

        let { x: inputX, y: inputY } = position
        if (direction === Direction.North) {
            inputY -= 1
        } else if (direction === Direction.East) {
            inputX += 1
        } else if (direction === Direction.South) {
            inputY += 1
        } else if (direction === Direction.West) {
            inputX -= 1
        }

        const [x, y] = wrapPosition(inputX, inputY)
        if (isObstructed(x, y)) {
            console.warn("cannot move to obstructed space")
            return
        }

        const positionId = uuid()
        Position.addOverride(positionId, {
            entity: playerEntity,
            value: { x, y },
        })

        try {
            const tx = await worldContract.write.move([direction])
            await waitForTransaction(tx)
        } finally {
            Position.removeOverride(positionId)
        }
    }

    const spawn = async (inputX: number, inputY: number) => {
        if (!playerEntity) {
            throw new Error("no player")
        }

        const canSpawn = getComponentValue(Player, playerEntity)?.value !== true
        if (!canSpawn) {
            throw new Error("already spawned")
        }

        const [x, y] = wrapPosition(inputX, inputY)
        if (isObstructed(x, y)) {
            console.warn("cannot spawn on obstructed space")
            return
        }

        const positionId = uuid()
        Position.addOverride(positionId, {
            entity: playerEntity,
            value: { x, y },
        })
        const playerId = uuid()
        Player.addOverride(playerId, {
            entity: playerEntity,
            value: { value: true },
        })

        try {
            const tx = await worldContract.write.spawn([x, y])
            await waitForTransaction(tx)
        } finally {
            Position.removeOverride(positionId)
            Player.removeOverride(playerId)
        }
    }

    const throwBall = async () => {
        const player = playerEntity
        if (!player) {
            throw new Error("no player")
        }

        const encounter = getComponentValue(Encounter, player)
        if (!encounter) {
            throw new Error("no encounter")
        }

        const tx = await worldContract.write.throwBall()
        await waitForTransaction(tx)

        const catchAttempt = getComponentValue(MonsterCatchAttempt, player)
        if (!catchAttempt) {
            throw new Error("no catch attempt found")
        }

        return catchAttempt.result as MonsterCatchResult
    }

    const fleeEncounter = async () => {
        if (!playerEntity) {
            throw new Error("no player")
        }

        const tx = await worldContract.write.flee()
        await waitForTransaction(tx)
    }

    type Call<TArgs extends unknown[], R> = (...params: TArgs) => R
    type Promisify<T> = Promise<Awaited<T>>

    const createCall = <TArgs extends unknown[], R>(call: Call<TArgs, R>): Call<TArgs, Promisify<R>> => {
        return async (...params: TArgs): Promisify<R> => {
            await requestSessionKey(networkConfig.worldAddress as Address)
            return Promise.resolve(call(...params))
        }
    }

    return {
        move: createCall(move),
        spawn: createCall(spawn),
        throwBall: createCall(throwBall),
        fleeEncounter: createCall(fleeEncounter),
    }
}
