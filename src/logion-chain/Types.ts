import BN from 'bn.js';

export type AssetId = BN;

export type AssetBalance = BN;

export interface AssetMetadata {
    name: string,
    symbol: string,
    decimals: number
}

export interface Asset {
    assetId: AssetId,
    issuer: string,
    metadata: AssetMetadata,
}

export interface AssetWithBalance {
    asset: Asset,
    balance: string,
}
