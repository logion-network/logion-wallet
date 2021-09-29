[![Test](https://github.com/logion-network/logion-wallet/actions/workflows/test.yml/badge.svg)](https://github.com/logion-network/logion-wallet/actions/workflows/test.yml)

# Logion wallet


## Installation

For the most recent version and how to install yarn, please refer to [yarn](https://yarnpkg.com/) documentation and installation guides. 

```bash
yarn install
```

## Usage

Use below command in order to connect to a locally running node (development mode):

```bash
yarn start
```

You may also use the Docker way (see below).

### Setup

Use below command in order to connect to a specific node
(see [here](https://github.com/logion-network/logion-node) for instructions about doing so)
and service (see [here](https://github.com/logion-network/logion-backend))
.

```bash
export REACT_APP_PROVIDER_SOCKET=wss://example.org:9944 ; export REACT_APP_SERVICE_URL=https://example.org ; yarn start
```

You may have to change port numbers if you are not using the default configuration.


### Test users

Alice, Bob and Charlie are the accounts associated with the legal officers currently powering the Logion wallet.
In order to access the legal officer UI,
at least one legal officer keypair must be loaded in the Polkadot extension. The first step is to produce the secret
seed of one of those accounts. This is achieved with the following command:

    subkey inspect SECRET_URI

where `SECRET_URI` is `//Alice` for Alice and `//Bob` for Bob.

This is the list of test accounts' secret seeds:

- Alice: `0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a`
- Bob: `0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89`
- Charlie: `0xbc1ede780f784bb6991a585e4f6e61522c14e1cae6ad0895fb57b9a205a8f938`

In order to register them with the extension:

1. Use "Import account from pre-existing seed"
2. Encode the secret seed
3. Set a password

The logion wallet should now show the legal officer interface instead of the regular wallet if you log in with a
legal officer address.

Note that each account is linked to a specific Logion legal officer, it is probably a good idea
to name them accordingly in the extension:

- Alice is Patrick
- Bob is Guillaume
- Charlie is Eline


## Using Polkadot{.js}

[Polkadot{.js}](https://polkadot.js.org/apps/) can be used to
explore and interact with a Logion node. The procedure is as follows:

1. Launch the node locally (see above)
2. Launch the web app with [this link](https://polkadot.js.org/apps)
3. Select the local node by clicking on the top-left icon and selecting "Development > Local node"
4. Configure custom data (see `src/logion-chain/interfaces/definitions.ts`)
   in "Settings > Developer" screen and click "Save"
5. You should now be able to interact with the node running locally


## Generating custom types for Polkadot JS

The logion-chain SDK must be synchronized each time the logion node API changes (new custom types, queries,
transactions, etc.). To do so:

1. Update `src/logion-chain/interfaces/definitions.ts` file (may not be needed)
2. Start a local logion node
3. Run `yarn generate:defs-meta`

You are then able to fix and/or enrich the logion-chain SDK.

## Docker

### Build

    docker build . -t logion-wallet

### Run

    docker run --name my-logion-wallet -p 8080:80 logion-wallet

With your browser, you may now navigate to [http://localhost:8080](http://localhost:8080).

## Logion Components

* The [Node](https://github.com/logion-network/logion-node) is the implementation of the chain.
* The [Typescript backend](https://github.com/logion-network/logion-backend-ts) stores data which cannot be exposed publicly, or which wait legal officer's approval.
* The [Wallet](https://github.com/logion-network/logion-wallet) is the user application.
