import { sha256HexFromString } from "../common/hash";

export function toItemId(maybeHex: string): string | undefined {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return undefined;
    } else {
        return `0x${sha256HexFromString(maybeHex)}`;
    }
}

export type ContributionMode = 'Requester' | 'Issuer';
