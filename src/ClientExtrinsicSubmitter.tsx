import { ISubmittableResult, isSuccessful } from '@logion/client';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';

export interface SuccessfulTransaction {
    readonly block: string;
    readonly index: number;
}

export type CallCallback = (result: ISubmittableResult) => void;

export type Call = (callback: CallCallback) => Promise<void>;

export interface Props {
    successMessage?: string | JSX.Element,
    call?: Call,
    onSuccess?: (result: SuccessfulTransaction) => void,
    onError?: () => void,
    slim?: boolean,
}

export default function ClientExtrinsicSubmitter(props: Props) {
    const [ result, setResult ] = useState<ISubmittableResult | null>(null);
    const [ error, setError ] = useState<any>(null);
    const [ submitted, setSubmitted ] = useState<boolean>(false);
    const [ notified, setNotified ] = useState<boolean>(false);
    const [ callEnded, setCallEnded ] = useState<boolean>(false);

    useEffect(() => {
        if(!submitted && props.call !== undefined) {
            flushSync(() => setSubmitted(true));
            (async function() {
                setResult(null);
                setError(null);
                setCallEnded(false);
                try {
                    await props.call!((callbackResult: ISubmittableResult) => setResult(callbackResult));
                    setCallEnded(true);
                } catch(e) {
                    setError(e);
                }
            })();
        }
    }, [ setResult, setError, props, submitted ]);

    useEffect(() => {
        if (result !== null && isSuccessful(result) && !notified && props.onSuccess && callEnded) {
            setNotified(true);
            props.onSuccess!({
                block: result!.status.asInBlock.toString(),
                index: result!.txIndex!
            });
        }
    }, [ result, notified, setNotified, props, callEnded ]);

    useEffect(() => {
        if (error !== null && !notified && props.onError) {
            setNotified(true);
            props.onError!();
        }
    }, [ notified, setNotified, props, error ]);

    useEffect(() => {
        if(submitted && props.call === undefined) {
            setSubmitted(false);
            setNotified(false);
            setResult(null);
            setError(null);
        }
    }, [ setResult, setError, props, submitted ]);

    if(props.call === undefined) {
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
