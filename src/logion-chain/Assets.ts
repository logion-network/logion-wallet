import { ApiPromise } from '@polkadot/api';
import { StorageKey, Option } from '@polkadot/types';
import {
    AssetId as PolkadotAssetId,
    AssetDetails as PolkadotAsset,
    AssetMetadata as PolkadotAssetMetadata,
    Call
} from '@polkadot/types/interfaces';
import { randomBytes } from 'crypto';
import BN from 'bn.js';
import {
    AssetId as AssetIdType,
    AssetBalance as AssetBalanceType,
    AssetMetadata as AssetMetadataType,
    Asset as AssetType,
    AssetWithBalance as AssetWithBalanceType,
} from './Types';

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

export type AssetId = AssetIdType;

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

export type AssetMetadata = AssetMetadataType;

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
export type AssetBalance = AssetBalanceType;

export function balanceFromAmount(tokens: number, decimals: number): AssetBalance {
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

export interface AssetBalanceParameters {
    api: ApiPromise,
    assetId: AssetId,
    decimals: number,
    address: string,
}

export async function assetBalance(parameters: AssetBalanceParameters): Promise<string> {
    const {
        api,
        assetId,
        decimals,
        address,
    } = parameters;
    const balance = await api.query.assets.account(assetId, address);
    return tokensFromBalance(balance.balance, decimals);
}

export interface GetAssetsParameters {
    api: ApiPromise,
}

export type Asset = AssetType;

export async function getAssets(parameters: GetAssetsParameters): Promise<Asset[]> {
    const {
        api,
    } = parameters;
    const assetIds = extractAssetIds(await api.query.assets.asset.keys());
    const assetDetails: Option<PolkadotAsset>[] = await Promise.all(assetIds.map(assetId => api.query.assets.asset(assetId)));
    const metadata: PolkadotAssetMetadata[] = await Promise.all(assetIds.map(assetId => api.query.assets.metadata(assetId)));
    return assetIds.map((assetId, index) => {
        return {
            assetId,
            issuer: assetDetails[0].unwrap().issuer.toString(),
            metadata: {
                name: metadata[index].name.toUtf8(),
                symbol: metadata[index].symbol.toUtf8(),
                decimals: metadata[index].decimals.toNumber(),
            }
        };
    });
}

function extractAssetIds(keys: StorageKey<[PolkadotAssetId]>[]): AssetId[] {
    return keys.map(({ args: [assetId] }) => assetId);
}

export interface AccountBalanceParameters {
    api: ApiPromise,
    accountId: string,
    assets?: Asset[],
}

export type AssetWithBalance = AssetWithBalanceType;

export async function accountBalance(parameters: AccountBalanceParameters): Promise<AssetWithBalance[]> {
    const {
        api,
        accountId,
        assets,
    } = parameters;
    

    let theAssets;
    if(assets !== undefined) {
        theAssets = assets;
    } else {
        theAssets = await getAssets({api: api!});
    }
    const balances: string[] = await Promise.all(theAssets.map(asset => assetBalance({
        api,
        assetId: asset.assetId,
        decimals: asset.metadata.decimals,
        address: accountId
    })));
    return theAssets.map((asset, index) => ({
        asset,
        balance: balances[index],
    }));
}

export interface BuildTransferCallParameters {
    api: ApiPromise,
    assetId: AssetId,
    target: string,
    amount: AssetBalance,
}

export function buildTransferCall(parameters: BuildTransferCallParameters): Call {
    const {
        api,
        assetId,
        target,
        amount,
    } = parameters;

    return api.createType('Call', api.tx.assets.transfer(assetId, target, amount));
}
