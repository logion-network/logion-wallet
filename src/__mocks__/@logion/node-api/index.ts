import { ApiPromise } from "src/__mocks__/PolkadotApiMock";
export * from "@logion/node-api/dist/UUID.js";
export * from "@logion/node-api/dist/Extrinsics.js";

export function buildApi() {
    return new ApiPromise();
}

export * from "./dist/LogionLoc";
