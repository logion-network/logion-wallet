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

You can also build the app in production mode,

```bash
yarn build
```
and open `build/index.html` in your favorite browser.

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
    "AssetOf": {
        "name": "Vec<u8>"
    },
    "NewAsset": {
        "name": "Vec<u8>"
    },
    "PeerId": "(Vec<u8>)"
}
```
