import React, { useEffect, useState } from 'react';

import {
    SignedTransaction,
    isFinalized,
    unsubscribe,
    Unsubscriber
} from './logion-chain/Signature';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';

export type SignAndSubmit = ((setResult: React.Dispatch<React.SetStateAction<SignedTransaction | null>>, setError: React.Dispatch<React.SetStateAction<any>>) => Unsubscriber) | null;

export interface Props {
    id: string,
    successMessage?: string | JSX.Element,
    signAndSubmit: SignAndSubmit,
    onSuccess: (id: string) => void,
    onError: (id: string) => void,
}

export default function ExtrinsicSubmitter(props: Props) {
    const [ result, setResult ] = useState<SignedTransaction | null>(null);
    const [ error, setError ] = useState<any>(null);
    const [ unsubscriber, setUnsubscriber ] = useState<Unsubscriber | null>(null);
    const [ submitted, setSubmitted ] = useState<boolean>(false);
    const [ notified, setNotified ] = useState<boolean>(false);

    useEffect(() => {
        if(!submitted && props.signAndSubmit !== null) {
            setSubmitted(true);
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
        if (isFinalized(result) && !notified) {
            setNotified(true);
            (async function() {
                await unsubscribe(unsubscriber);
                props.onSuccess(props.id);
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
    }, [ result, notified, setNotified, props, error, unsubscriber ]);

    useEffect(() => {
        if(submitted && props.signAndSubmit === null) {
            setSubmitted(false);
            setNotified(false);
            setResult(null);
            setError(null);
        }
    }, [ unsubscriber, setUnsubscriber, setResult, setError, props, submitted ]);

    if(props.signAndSubmit === null) {
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
