import { LocData } from '@logion/client';
import { ValidAccountId } from "@logion/node-api";

export function isGrantedAccess(address: ValidAccountId | undefined, loc: LocData): boolean {
    return loc.ownerAccountId.equals(address) || (loc.requesterAccountId?.equals(address) || false);
}
