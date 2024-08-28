# HappyChain MUD Demo

This repo forks the [Emojimon](https://github.com/latticexyz/emojimon) repo with the `@happychain/react` package used to handle wallet connections / social login with web3auth.

## Basic Setup 

Run `pnpm dev` in the root of the project, mprocs handles contract deployments and client runs. 
Otherwise, run `pnpm dev` first in `packages/contracts` and then subsequently in `packages/client`.

To link the `@happychain/react` SDK: 
- Run `pnpm build` and `pnpm link --global` in the `sdk-react` folder in the local HappyChain repo.
- Run `pnpm link --global @happychain/react` in the client folder on the MUD demo repo. 

Then, run `make dev` in the `packages/iframe` directory of the HappyChain repo, this allows for the button + iframe to render when <HappyWalletProvider /> is used in the MUD demo client.