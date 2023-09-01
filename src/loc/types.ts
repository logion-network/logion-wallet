import { Hash } from "@logion/node-api";

export function toItemId(maybeHex: string): Hash | undefined {
    if(Hash.isValidHexHash(maybeHex)) {
        return Hash.fromHex(maybeHex);
    } else if(maybeHex.startsWith("0x")) {
        return undefined;
    } else {
        return Hash.of(maybeHex);
    }
}

export type ContributionMode = 'Requester' | 'VerifiedIssuer';
