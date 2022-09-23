import { ApiPromise } from "src/__mocks__/PolkadotApiMock";
export * from "@logion/node-api/dist/UUID";

export function buildApi() {
    return new ApiPromise();
}

export * from "./dist/LogionLoc";
