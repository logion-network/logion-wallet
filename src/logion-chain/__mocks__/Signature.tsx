import {
    signAndSend,
    unsubscribe,
    replaceUnsubscriber,
    sign,
    isFinalized,
} from './SignatureMock';

export {
    signAndSend,
    unsubscribe,
    replaceUnsubscriber,
    sign,
    isFinalized,
};

import {
    SignedTransaction as RealSignedTransaction
} from '../Signature';
export type SignedTransaction = RealSignedTransaction;
