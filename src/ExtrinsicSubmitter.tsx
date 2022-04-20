import React, { useEffect, useState } from 'react';

import {
    SignedTransaction,
    isSuccessful,
    unsubscribe,
    Unsubscriber
} from './logion-chain/Signature';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';
import { flushSync } from 'react-dom';

export type SignAndSubmit = ((setResult: React.Dispatch<React.SetStateAction<SignedTransaction | null>>, setError: React.Dispatch<React.SetStateAction<any>>) => Unsubscriber) | null;

export type AsyncSignAndSubmit = ((setResult: React.Dispatch<React.SetStateAction<SignedTransaction | null>>, setError: React.Dispatch<React.SetStateAction<any>>) => Promise<{ unsubscriber: Unsubscriber }>) | null;

export interface SuccessfulTransaction {
    readonly block: string;
    readonly index: number;
}

export interface Props {
    id: string,
    successMessage?: string | JSX.Element,
    signAndSubmit?: SignAndSubmit,
    asyncSignAndSubmit?: AsyncSignAndSubmit,
    onSuccess: (id: string, result: SuccessfulTransaction) => void,
    onError: (id: string) => void,
}

export default function ExtrinsicSubmitter(props: Props) {
    const [ result, setResult ] = useState<SignedTransaction | null>(null);
    const [ error, setError ] = useState<any>(null);
    const [ unsubscriber, setUnsubscriber ] = useState<Unsubscriber | null>(null);
    const [ submitted, setSubmitted ] = useState<boolean>(false);
    const [ notified, setNotified ] = useState<boolean>(false);

    useEffect(() => {
        if(!submitted && props.signAndSubmit !== undefined && props.signAndSubmit !== null) {
            flushSync(() => setSubmitted(true));
            const signAndSubmit = props.signAndSubmit;
            (async function() {
                await unsubscribe(unsubscriber);
                setResult(null);
                setError(null);
                const newSubscriber = signAndSubmit(setResult, setError);
                setUnsubscriber(newSubscriber);
            })();
        }
    }, [ unsubscriber, setUnsubscriber, setResult, setError, props, submitted ]);

    useEffect(() => {
        if(!submitted && props.asyncSignAndSubmit !== undefined && props.asyncSignAndSubmit !== null) {
            flushSync(() => setSubmitted(true));
            const signAndSubmit = props.asyncSignAndSubmit;
            (async function() {
                await unsubscribe(unsubscriber);
                setResult(null);
                setError(null);
                const newSubscriber = await signAndSubmit(setResult, setError);
                setUnsubscriber(newSubscriber.unsubscriber);
            })();
        }
    }, [ unsubscriber, setUnsubscriber, setResult, setError, props, submitted ]);

    useEffect(() => {
        if (isSuccessful(result) && !notified) {
            setNotified(true);
            (async function() {
                await unsubscribe(unsubscriber);
                props.onSuccess(props.id, {
                    block: result!.status.asInBlock.toString(),
                    index: result!.txIndex!
                });
            })();
        }
    }, [ result, notified, setNotified, props, unsubscriber ]);

    useEffect(() => {
        if (error !== null && !notified) {
            setNotified(true);
            (async function() {
                await unsubscribe(unsubscriber);
                props.onError(props.id);
            })();
        }
    }, [ notified, setNotified, props, error, unsubscriber ]);

    useEffect(() => {
        if(submitted && props.signAndSubmit === null) {
            setSubmitted(false);
            setNotified(false);
            setResult(null);
            setError(null);
        }
    }, [ unsubscriber, setUnsubscriber, setResult, setError, props, submitted ]);

    if(props.signAndSubmit === null || props.asyncSignAndSubmit === null) {
        return null;
    }

    return (
        <ExtrinsicSubmissionResult
            result={result}
            error={error}
            successMessage={ props.successMessage }
        />
    );
}
