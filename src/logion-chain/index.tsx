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
    sign,

    ExtrinsicSignatureParameters as SignatureExtrinsicSignatureParameters,
    Unsubscriber as SignatureUnsubscriber,
    SignAndSendCallback as SignatureSignAndSendCallback,
    AttributesSignatureParameters as SignatureStringSignatureParameters,
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

// Re-exports
export {
    useLogionChain,
    LogionChainContextProvider,
    getTimestamp,
    fetchExtrinsics,
    hashEquals,
    signAndSend,
    replaceUnsubscriber,
    isExtensionAvailable,
    recommendedExtension,
    keyring,
    sign,
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
export type StringSignatureParameters = SignatureStringSignatureParameters;
export type ISubmittableResult = PolkadotISubmittableResult;
