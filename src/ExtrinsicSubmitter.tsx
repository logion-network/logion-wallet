import React, { useEffect, useState } from 'react';
import { isSuccessful } from '@logion/client';

import {
    SignedTransaction,
} from './logion-chain/Signature';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';
import { flushSync } from 'react-dom';

export type SignAndSubmit = ((setResult: React.Dispatch<React.SetStateAction<SignedTransaction | null>>, setError: React.Dispatch<React.SetStateAction<any>>) => void) | null;

export interface SuccessfulTransaction {
    readonly block: string;
    readonly index: number;
}

export interface Props {
    id: string,
    successMessage?: string | JSX.Element,
    signAndSubmit: SignAndSubmit,
    onSuccess: (id: string, result: SuccessfulTransaction) => void,
    onError: (id: string) => void,
    slim?: boolean,
}

export default function ExtrinsicSubmitter(props: Props) {
    const [ result, setResult ] = useState<SignedTransaction | null>(null);
    const [ error, setError ] = useState<any>(null);
    const [ submitted, setSubmitted ] = useState<boolean>(false);
    const [ notified, setNotified ] = useState<boolean>(false);

    useEffect(() => {
        if(!submitted && props.signAndSubmit !== null) {
            flushSync(() => setSubmitted(true));
            const signAndSubmit = props.signAndSubmit;
            (async function() {
                setResult(null);
                setError(null);
                signAndSubmit(setResult, setError);
            })();
        }
    }, [ setResult, setError, props, submitted ]);

    useEffect(() => {
        if (result !== null && isSuccessful(result) && !notified) {
            setNotified(true);
            (async function() {
                props.onSuccess(props.id, {
                    block: result!.status.asInBlock.toString(),
                    index: result!.txIndex!
                });
            })();
        }
    }, [ result, notified, setNotified, props ]);

    useEffect(() => {
        if (error !== null && !notified) {
            setNotified(true);
            (async function() {
                props.onError(props.id);
            })();
        }
    }, [ notified, setNotified, props, error ]);

    useEffect(() => {
        if(submitted && props.signAndSubmit === null) {
            setSubmitted(false);
            setNotified(false);
            setResult(null);
            setError(null);
        }
    }, [ setResult, setError, props, submitted ]);

    if(props.signAndSubmit === null) {
        return null;
    }

    return (
        <ExtrinsicSubmissionResult
            result={result}
            error={error}
            successMessage={ props.successMessage }
            slim={ props.slim }
        />
    );
}
