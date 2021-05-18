import React, {EventHandler} from 'react';
import Button from "react-bootstrap/Button";

export interface Props {
    onSubmit: EventHandler<any>;
    onCancel: EventHandler<any>;
}

export default function CreateTokenizationRequest(props: Props) {

    return (
        <form>
            <input
                type="text"
                placeholder="Token name"
            />
            <input
                type="text"
                placeholder="Number of Gold Bars"
            />
            <Button data-testid="btnSubmit" onClick={props.onSubmit}>Submit</Button>
            <Button data-testid="btnCancel" onClick={props.onCancel}>Cancel</Button>
        </form>
    )
}
