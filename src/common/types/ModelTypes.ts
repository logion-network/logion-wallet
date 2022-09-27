import { UserIdentity } from '@logion/client';
import { LocType } from '@logion/node-api';

export interface LocRequestFragment {
    requesterAddress?: string | null;
    requesterIdentityLoc?: string | null;
    locType: LocType;
    userIdentity?: UserIdentity;
}

export function isLogionIdentityLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Identity' && !loc.requesterAddress && !loc.requesterIdentityLoc;
}

export function isLogionTransactionLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Transaction' && (loc.requesterIdentityLoc !== undefined && loc.requesterIdentityLoc !== null);
}
