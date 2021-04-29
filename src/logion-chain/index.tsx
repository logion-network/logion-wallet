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

    SignatureParameters as SignatureSignatureParameters,
    Unsubscriber as SignatureUnsubscriber,
    SignAndSendCallback as SignatureSignAndSendCallback,
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
};

export type Unsubscriber = SignatureUnsubscriber;
export type SignatureParameters = SignatureSignatureParameters;
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
