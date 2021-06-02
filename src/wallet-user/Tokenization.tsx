import CreateTokenizationRequest from "./CreateTokenizationRequest";
import ConfirmTokenization from "./ConfirmTokenization";
import React, {useState} from "react";
import Button from "react-bootstrap/Button";

import './Tokenization.css';

export enum State {
    START,
    REQUEST_TOKENIZATION,
    REQUEST_TOKENIZATION_DONE
}

export interface Props {
    initialState?: State
}

export default function Tokenization(props: Props) {

    const [state, setState] = useState(props.initialState !== null ? props.initialState : State.START)

    return (
        <div className="Tokenization">
            <Button disabled={state === State.REQUEST_TOKENIZATION} onClick={() => setState(State.REQUEST_TOKENIZATION)}>
                Create token
            </Button>
            {state === State.REQUEST_TOKENIZATION && (
                <CreateTokenizationRequest
                    onSubmit={() => setState(State.REQUEST_TOKENIZATION_DONE)}
                    onCancel={() => setState(State.START)}/>
            )}
            {state === State.REQUEST_TOKENIZATION_DONE && (
                <ConfirmTokenization/>
            )}
        </div>
    );
}
