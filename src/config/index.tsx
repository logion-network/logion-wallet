import { RegistryTypes } from '@polkadot/types/types/registry';

export interface Node {
    name: string,
    socket: string,
    peerId: string,
}

export interface ConfigType {
    APP_NAME: string,
    DEVELOPMENT_KEYRING: boolean,
    PROVIDER_SOCKET?: string,
    RPC: object,
    types: RegistryTypes,
    availableNodes: Node[],
}

export const DEFAULT_CONFIG: ConfigType = {
    APP_NAME: "Logion Wallet",
    DEVELOPMENT_KEYRING: true,
    RPC: {
        
    },
    types: {
        Address: "MultiAddress",
        LookupSource: "MultiAddress",
        PeerId: "(Vec<u8>)",
        AccountInfo: "AccountInfoWithDualRefCount",
        TAssetBalance: "u128",
        AssetId: "u64",
        AssetDetails: {
            owner: "AccountId",
            issuer: "AccountId",
            admin: "AccountId",
            freezer: "AccountId",
            supply: "Balance",
            deposit: "DepositBalance",
            max_zombies: "u32",
            min_balance: "Balance",
            zombies: "u32",
            accounts: "u32",
            is_frozen: "bool"
        },
        AssetMetadata: {
            deposit: "DepositBalance",
            name: "Vec<u8>",
            symbol: "Vec<u8>",
            decimals: "u8"
        }
    },
    availableNodes: []
};

export interface EnvConfigType extends Record<string, any> {

}

const configEnv: EnvConfigType = require(`./${process.env.NODE_ENV}.json`);

const envVarNames: string[] = [
  'REACT_APP_PROVIDER_SOCKET',
  'REACT_APP_DEVELOPMENT_KEYRING'
];
const envVars: EnvConfigType = envVarNames.reduce<EnvConfigType>((mem, n) => {
    if (process.env[n] !== undefined) {
        const configFieldName = n.slice(10);
        mem[configFieldName] = process.env[n];
    }
    return mem;
}, {});

const config: ConfigType = { ...DEFAULT_CONFIG, ...configEnv, ...envVars };
export default config;
