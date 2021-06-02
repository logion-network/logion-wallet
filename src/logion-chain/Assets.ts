import { ApiPromise } from '@polkadot/api';
import { randomBytes } from 'crypto';
import BN from 'bn.js';

import {
    SignAndSendCallback,
    ErrorCallback,
    signAndSend,
    Unsubscriber
} from './Signature';

export const DEFAULT_ASSETS_DECIMALS = 18;

export interface AssetCreationParameters {
    signerId: string,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback,
    api: ApiPromise,
}

export type AssetId = BN;

export interface AssetCreationResult {
    assetId: AssetId,
    unsubscriber: Unsubscriber,
}

export async function createAsset(parameters: AssetCreationParameters): Promise<AssetCreationResult> {
    const {
        api,
        signerId,
        callback,
        errorCallback,
    } = parameters;

    const assetId = await nextAssetId(api);
    const assetCreate: any = api.tx.assets.create; // circumvent typing in order to add missing argument
    const unsubscriber = signAndSend({
        signerId,
        submittable: assetCreate(assetId, signerId, 10, 1),
        callback,
        errorCallback,
    });

    return {
        assetId,
        unsubscriber
    };
}

async function nextAssetId(api: ApiPromise): Promise<AssetId> {
    const BYTES_IN_ASSET_ID = 64 / 8;
    const value = randomBytes(BYTES_IN_ASSET_ID);
    let candidate = new BN(value.toString('hex'), 16);
    let candidateUsed = await assetExists(api, candidate);

    let iteration = 0;
    const MAX_ITERATIONS = 10;
    while(candidateUsed && iteration < MAX_ITERATIONS) {
        candidate = new BN(value.toString('hex'), 16);
        candidateUsed = await assetExists(api, candidate);
        ++iteration;
    }

    if(candidateUsed) {
        throw new Error("Unable to select an unused ID");
    } else {
        return candidate;
    }
}

async function assetExists(api: ApiPromise, id: AssetId): Promise<boolean> {
    const asset = await api.query.assets.asset(id);
    return asset.isSome;
}

export interface AssetMetadata {
    name: string,
    symbol: string,
    decimals: number
}

export interface SetAssetMetadataParameters {
    signerId: string,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback,
    api: ApiPromise,
    assetId: AssetId,
    metadata: AssetMetadata,
}

export function setAssetMetadata(parameters: SetAssetMetadataParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        assetId,
        metadata,
    } = parameters;
    return signAndSend({
        signerId,
        submittable: api.tx.assets.setMetadata(assetId, metadata.name, metadata.symbol, metadata.decimals),
        callback,
        errorCallback,
    });
}

export type AssetBalance = BN;

export function mintAmount(tokens: number, decimals: number): AssetBalance {
    let tokensBN = new BN(tokens);
    let decimalsBN = new BN(decimals);
    let ten = new BN(10);
    return tokensBN.mul(ten.pow(decimalsBN));
}

export interface MintParameters {
    signerId: string,
    beneficiary: string,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback,
    api: ApiPromise,
    assetId: AssetId,
    amount: AssetBalance
}

export function mintTokens(parameters: MintParameters): Unsubscriber {
    const {
        api,
        signerId,
        beneficiary,
        callback,
        errorCallback,
        assetId,
        amount,
    } = parameters;
    return signAndSend({
        signerId,
        submittable: api.tx.assets.mint(assetId, beneficiary, amount),
        callback,
        errorCallback,
    });
}

export function tokensFromBalance(balance: AssetBalance, decimals: number): string {
    let balanceBN = new BN(balance);
    let exponent = new BN(decimals);
    let ten = new BN(10);
    return balanceBN.div(ten.pow(exponent)).toString();
}
