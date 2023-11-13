import { useEffect, useState } from 'react';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';
import { useLogionChain } from './logion-chain';
import { SignAndSubmit } from './logion-chain/LogionChainContext';

export type { SignAndSubmit };

export interface Props {
    id: string,
    successMessage?: string | JSX.Element,
    signAndSubmit: SignAndSubmit,
    onSuccess: (id: string) => void,
    onError: (id: string) => void,
    slim?: boolean,
}

export default function ExtrinsicSubmitter(props: Props) {
    const { extrinsicSubmissionState, submitSignAndSubmit, resetSubmissionState } = useLogionChain();
    const [ notified, setNotified ] = useState(false);

    useEffect(() => {
        if(props.signAndSubmit !== null && !notified && extrinsicSubmissionState.canSubmit()) {
            submitSignAndSubmit(props.signAndSubmit);
        }
    }, [ extrinsicSubmissionState, props, submitSignAndSubmit, notified ]);

    useEffect(() => {
        if (extrinsicSubmissionState.isSuccessful() && !notified && props.onSuccess) {
            setNotified(true);
            resetSubmissionState();
            props.onSuccess(props.id);
        }
    }, [ extrinsicSubmissionState, props, notified, resetSubmissionState ]);

    useEffect(() => {
        if (extrinsicSubmissionState.isError() && !notified && props.onError) {
            setNotified(true);
            resetSubmissionState();
            props.onError(props.id);
        }
    }, [ extrinsicSubmissionState, props, notified, resetSubmissionState ]);

    if(props.signAndSubmit === null) {
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
