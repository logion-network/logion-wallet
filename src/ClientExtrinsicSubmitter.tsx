import { useEffect, useState } from 'react';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';
import { useLogionChain } from './logion-chain';
import { Call, CallCallback } from './logion-chain/LogionChainContext';

export type { Call, CallCallback };

export interface Props {
    successMessage?: string | JSX.Element,
    call?: Call,
    onSuccess?: () => void,
    onError?: () => void,
    slim?: boolean,
}

export default function ClientExtrinsicSubmitter(props: Props) {
    const { extrinsicSubmissionState, submitCall, resetSubmissionState } = useLogionChain();
    const [ notified, setNotified ] = useState(false);

    useEffect(() => {
        if(props.call !== undefined && extrinsicSubmissionState.canSubmit()) {
            submitCall(props.call);
        }
    }, [ extrinsicSubmissionState, submitCall, props ]);

    useEffect(() => {
        if (extrinsicSubmissionState.isSuccessful() && !notified && props.onSuccess) {
            setNotified(true);
            resetSubmissionState();
            props.onSuccess();
        }
    }, [ extrinsicSubmissionState, props, notified, resetSubmissionState ]);

    useEffect(() => {
        if (extrinsicSubmissionState.isError() && !notified && props.onError) {
            setNotified(true);
            resetSubmissionState();
            props.onError();
        }
    }, [ extrinsicSubmissionState, props, notified, resetSubmissionState ]);

    if(props.call === undefined) {
        return null;
    }

    return (
        <ExtrinsicSubmissionResult
            result={extrinsicSubmissionState.result}
            error={extrinsicSubmissionState.error}
            successMessage={ props.successMessage }
            slim={ props.slim }
        />
    );
}
