import { UserIdentity } from '@logion/client';
import { LocType, UUID } from '@logion/node-api';

export interface LocRequestFragment {
    requesterAddress?: string | null;
    requesterLocId?: UUID | null;
    locType: LocType;
    userIdentity?: UserIdentity;
}

export function isLogionIdentityLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Identity' && !loc.requesterAddress && !loc.requesterLocId;
}

export function isLogionTransactionLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Transaction' && (loc.requesterLocId !== undefined && loc.requesterLocId !== null);
}
