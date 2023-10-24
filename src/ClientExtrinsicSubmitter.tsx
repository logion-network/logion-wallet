import { ISubmittableResult } from '@logion/client';
import { useEffect, useState } from 'react';

import ExtrinsicSubmissionResult, { isSuccessful } from './ExtrinsicSubmissionResult';

export type CallCallback = (result: ISubmittableResult) => void;

export type Call = (callback: CallCallback) => Promise<void>;

export interface Props {
    successMessage?: string | JSX.Element,
    call?: Call,
    onSuccess?: () => void,
    onError?: () => void,
    slim?: boolean,
}

interface State {
    result: ISubmittableResult | null;
    error: any;
    submitted: boolean;
    notified: boolean;
    callEnded: boolean;
    call?: Call;
    setState: (newState: State) => void;
}

const INITIAL_STATE: State = {
    result: null,
    error: null,
    submitted: false,
    notified: false,
    callEnded: false,
    setState: () => {},
};

let persistentState: State = INITIAL_STATE;

function setPersistentState(stateUpdate: Partial<State>) {
    persistentState = {
        ...persistentState,
        ...stateUpdate
    };
    persistentState.setState(persistentState);
}

export function resetPersistenState() {
    persistentState = INITIAL_STATE;
}

export default function ClientExtrinsicSubmitter(props: Props) {
    const [ state, setState ] = useState<State>(persistentState);
    if(setState !== persistentState.setState) {
        persistentState.setState = setState;
    }

    useEffect(() => {
        if(props.call !== undefined && (!state.submitted || (state.notified && props.call !== state.call))) {
            setPersistentState({
                ...INITIAL_STATE,
                call: props.call,
                submitted: true,
                setState,
            });
            (async function() {
                try {
                    await props.call!((callbackResult: ISubmittableResult) => setPersistentState({ result: callbackResult }));
                    setPersistentState({ callEnded: true });
                } catch(e) {
                    console.log(e);
                    setPersistentState({ callEnded: true, error: e});
                }
            })();
        }
    }, [ state, props ]);

    useEffect(() => {
        if (state.result !== null && isSuccessful(state.result) && !state.notified && props.onSuccess && state.callEnded) {
            setPersistentState({ notified: true });
            props.onSuccess();
        }
    }, [ state, props ]);

    useEffect(() => {
        if (state.error !== null && !state.notified && props.onError) {
            setPersistentState({ notified: true });
            props.onError();
        }
    }, [ state, props ]);

    if(props.call === undefined) {
        return null;
    }

    return (
        <ExtrinsicSubmissionResult
            result={state.result}
            error={state.error}
            successMessage={ props.successMessage }
            slim={ props.slim }
        />
    );
}
