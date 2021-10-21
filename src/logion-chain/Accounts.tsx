import { ApiPromise } from '@polkadot/api';

export function isValidAccountId(api: ApiPromise, accountId?: string | null): boolean {
    if(accountId === null || accountId === undefined || accountId === '') {
        return false;
    }

    try {
        api.createType('AccountId', accountId);
        return true;
    } catch(e) {
        return false;
    }
}
