# HappyChain + MUD Demo (Emojimon)

This repository showcases the Happy Wallet by integrating it into the [MUD Emojimon tutorial][emojimon].

[emojimon]: https://mud.dev/tutorials/emojimon/

> A Pokémon-inspired on-chain game with [MUD](https://mud.dev/) and [HappyChain](https://docs.happy.tech/).

![emojimon demo](https://github.com/latticexyz/mud/blob/3fdaa9880639a9546f80fbffdcc4a713178328c1/tutorials/emojimon/images/emojimon-intro.gif?raw=true)

## Instructions

#### Pre-requisites

1. Node.js v18
2. pnpm (`npm install pnpm --global`)
3. [foundry](https://book.getfoundry.sh/getting-started/installation)

#### Running the game

1. Run `pnpm install`
2. Claim some tesnet $HAPPY on [the faucet](https://happy-testnet-sepolia.hub.caldera.xyz/) (or
   reach out to the team for a bigger allocation).
3. Define `PRIVATE_KEY` in `packages/contracts/.env` to your private key.
4. Run `pnpm dev` and the game will be available at [http://localhost:3000](http://localhost:3000)
   after a few seconds.

