[![Test](https://github.com/logion-network/logion-wallet/actions/workflows/test.yml/badge.svg)](https://github.com/logion-network/logion-wallet/actions/workflows/test.yml)

# Logion wallet


## Installation

For the most recent version and how to install yarn, please refer to [yarn](https://yarnpkg.com/) documentation and installation guides. 

```bash
yarn install
```

## Usage

You can start the prototype in development mode to connect to a locally running node

```bash
yarn start
```

### Test users

Alice and Bob are the accounts associated with the legal officers currently powering the Logion wallet.
In order to access the legal officer UI,
Alice's keypair must be loaded in the Polkadot extension. The first step is to produce the secred seed of Alice and Bob.
This is achieved with the following command:

    subkey inspect SECRET_URI

where `SECRET_URI` is `//Alice` for Alice and `//Bob` for Bob.

The secret seeds are provided as a convenience:
- Alice: `0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a`
- Bob: `0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89`

Then:

1. Use "Import account from pre-existing seed"
2. Encode the secret seed
3. Set a password

The logion wallet should now show the legal officer interface instead of the regular wallet is Bob or Alice is loaded
and visible.

Note that the Alice account is linked to Patrick and Bob account is linked to Guillaume, it is probably a good idea
to name them accordingly in the extension (i.e., use 'Patrick' instead of 'Alice' and 'Guillaume' instead of 'Bob').


## Configuration

The prototype's configuration is stored in the `src/config` directory, with
`common.json` being loaded first, then the environment-specific json file,
and finally environment variables, with precedence.

* `development.json` affects the development environment
* `test.json` affects the test environment, triggered in `yarn test` command.
* `production.json` affects the production environment, triggered in
`yarn build` command.

Some environment variables are read and integrated in the template `config` object,
including:

* `REACT_APP_PROVIDER_SOCKET` overriding `config[PROVIDER_SOCKET]`
* `REACT_APP_DEVELOPMENT_KEYRING` overriding `config[DEVELOPMENT_KEYRING]`

More on [React environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables).

### Specifying Connecting Node

There are two ways to specify it:

* With `PROVIDER_SOCKET` in `{common, development, production}.json`.

## Using Polkadot{.js}

[Polkadot{.js}](https://polkadot.js.org/apps/) can be used to
explore and interact with a Logion node. The procedure is as follows:

1. Launch the node locally (see above)
2. Launch the web app with [this link](https://polkadot.js.org/apps)
3. Select the local node by clicking on the top-left icon and selecting "Development > Local node"
4. Configure below custom data in "Settings > Developer" screen and click "Save"
5. You should now be able to interact with the locally running node

```
{
  "Address": "MultiAddress",
  "LookupSource": "MultiAddress",
  "AccountInfo": "AccountInfoWithDualRefCount",
  "PeerId": "(Vec<u8>)",
  "TAssetBalance": "u128",
  "AssetId": "u64",
  "AssetDetails": {
    "owner": "AccountId",
    "issuer": "AccountId",
    "admin": "AccountId",
    "freezer": "AccountId",
    "supply": "Balance",
    "deposit": "DepositBalance",
    "max_zombies": "u32",
    "min_balance": "Balance",
    "zombies": "u32",
    "accounts": "u32",
    "is_frozen": "bool"
  },
  "AssetMetadata": {
    "deposit": "DepositBalance",
    "name": "Vec<u8>",
    "symbol": "Vec<u8>",
    "decimals": "u8"
  }
}
```
