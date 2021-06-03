import React, {useState} from "react";
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ConfirmProtectionRequest from "./ConfirmProtectionRequest";
import './TrustProtection.css';

export enum State {
    START,
    REQUEST_PROTECTION_DONE
}

export interface Props {
    initialState?: State
}

export default function LegalOfficerSelection(props: Props) {

    const [state, setState] = useState(props.initialState !== undefined ? props.initialState : State.START)

    return (
        <div className="TrustProtection">
            {state === State.START && (
                <CreateProtectionRequestForm
                    onSubmit={() => setState(State.REQUEST_PROTECTION_DONE)}/>
            )}
            {state === State.REQUEST_PROTECTION_DONE && (
                <ConfirmProtectionRequest/>
            )}
        </div>
    );

}
