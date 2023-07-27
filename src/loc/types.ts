import { Hash, hashString } from "@logion/node-api";

export function toItemId(maybeHex: string): Hash | undefined {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex as Hash;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return undefined;
    } else {
        return hashString(maybeHex);
    }
}

export type ContributionMode = 'Requester' | 'Issuer';
