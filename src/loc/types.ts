import { hashString } from "@logion/client";

export function toItemId(maybeHex: string): string | undefined {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return undefined;
    } else {
        return hashString(maybeHex);
    }
}

export type ContributionMode = 'Requester' | 'Issuer';
