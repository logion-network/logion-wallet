// Imports
import { KeyringPair as PolkadotKeyringPair } from '@polkadot/keyring/types';
import {
    Block as PolkadotBlock,
    Hash as PolkadotHash,
    Header as PolkadotHeader,
    SignedBlock as PolkadotSignedBlock,
    EventRecord as PolkadotEventRecord,
    Extrinsic as PolkadotExtrinsic,
} from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { InjectedAccountWithMeta as PolkadotInjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ISubmittableResult as PolkadotISubmittableResult } from '@polkadot/types/types';

import {
    LogionChainContextProvider,
    useLogionChain,

    ExtrinsicFetchSpecification as ContextExtrinsicFetchSpecification,
    ApiState as ContextApiState,
    NodeMetadata as ContextNodeMetadata,
} from './LogionChainContext';

import {
    signAndSend,
    replaceUnsubscriber,
    unsubscribe,
    sign,
    isFinalized,

    ExtrinsicSignatureParameters as SignatureExtrinsicSignatureParameters,
    Unsubscriber as SignatureUnsubscriber,
    SignAndSendCallback as SignatureSignAndSendCallback,
    AttributesSignatureParameters as SignatureAttributesSignatureParameters,
} from './Signature';

import {
    getTimestamp,
    fetchExtrinsics,
    hashEquals,

    ExtrinsicsAndHead as BlocksExtrinsicsAndHead,
} from './Blocks';

import {
    isExtensionAvailable,
    recommendedExtension
} from './Keys';

import {
    createAsset,
    setAssetMetadata,
    mintAmount,
    mintTokens,
    DEFAULT_ASSETS_DECIMALS,

    AssetCreationParameters as AssetsAssetCreationParameters,
    AssetId as AssetsAssetId,
    AssetBalance as AssetsAssetBalance,
} from './Assets';

// Re-exports
export {
    useLogionChain,
    LogionChainContextProvider,
    getTimestamp,
    fetchExtrinsics,
    hashEquals,
    signAndSend,
    replaceUnsubscriber,
    unsubscribe,
    isExtensionAvailable,
    recommendedExtension,
    keyring,
    sign,
    createAsset,
    isFinalized,
    setAssetMetadata,
    mintAmount,
    mintTokens,
    DEFAULT_ASSETS_DECIMALS,
};

export type Unsubscriber = SignatureUnsubscriber;
export type ExtrinsicSignatureParameters = SignatureExtrinsicSignatureParameters;
export type ExtrinsicFetchSpecification = ContextExtrinsicFetchSpecification;

export type ExtrinsicsAndHead = BlocksExtrinsicsAndHead;

export type KeyringPair = PolkadotKeyringPair;
export type Hash = PolkadotHash;
export type SignedBlock = PolkadotSignedBlock;
export type Header = PolkadotHeader;
export type Block = PolkadotBlock;
export type EventRecord = PolkadotEventRecord;
export type Extrinsic = PolkadotExtrinsic;
export type SignAndSendCallback = SignatureSignAndSendCallback;
export type ApiState = ContextApiState;
export type NodeMetadata = ContextNodeMetadata;
export type InjectedAccountWithMeta = PolkadotInjectedAccountWithMeta;
export type AttributesSignatureParameters = SignatureAttributesSignatureParameters;
export type ISubmittableResult = PolkadotISubmittableResult;
export type AssetCreationParameters = AssetsAssetCreationParameters;
export type AssetId = AssetsAssetId;
export type AssetBalance = AssetsAssetBalance;
