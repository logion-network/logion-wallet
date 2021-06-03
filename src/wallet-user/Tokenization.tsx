import React, { useState, useCallback } from "react";
import Button from "react-bootstrap/Button";

import { useUserContext } from './UserContext';

import CreateTokenizationRequest from "./CreateTokenizationRequest";
import './Tokenization.css';

export enum State {
    START,
    REQUEST_TOKENIZATION
}

export interface Props {
    initialState?: State
}

export default function Tokenization(props: Props) {
    const { refreshRequests } = useUserContext();
    const [state, setState] = useState(props.initialState !== null ? props.initialState : State.START)

    const completeTokenization = useCallback(() => {
        setState(State.START);
        refreshRequests!();
    }, [ setState, refreshRequests ]);

    return (
        <div className="Tokenization">
            <Button disabled={state === State.REQUEST_TOKENIZATION} onClick={() => setState(State.REQUEST_TOKENIZATION)}>
                Create token
            </Button>
            {state === State.REQUEST_TOKENIZATION && (
                <CreateTokenizationRequest
                    onSubmit={ completeTokenization }
                    onCancel={() => setState(State.START)}/>
            )}
        </div>
    );
}
