import { EnvironmentString } from "@logion/client";

export interface ConfigType {
    environment: EnvironmentString | undefined,
    APP_NAME: string,
    directory: string,
    rpcEndpoints: string[],
    crossmintApiKey: string,
    logionClassification: string,
    creativeCommons: string,
}

export const DEFAULT_CONFIG: ConfigType = {
    environment: undefined,
    APP_NAME: "Logion Wallet",
    directory: "",
    rpcEndpoints: [],
    crossmintApiKey: "",
    logionClassification: "",
    creativeCommons: "",
};

export interface EnvConfigType extends Record<string, any> {

}

const configEnv: EnvConfigType = require(`./${process.env.NODE_ENV}.json`);

declare var CONFIG: any;

const config: ConfigType = { ...DEFAULT_CONFIG, ...configEnv, ...CONFIG };
export default config;
