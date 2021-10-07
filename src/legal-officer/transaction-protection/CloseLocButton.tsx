import React, { useEffect, useState } from "react";
import Button from "../../common/Button";
import ProcessStep from "../ProcessStep";
import Alert from "../../common/Alert";
import ExtrinsicSubmitter, { SignAndSubmit } from "../../ExtrinsicSubmitter";
import { useLocContext } from "./LocContext";

enum CloseStatus {
    NONE,
    START,
    CLOSE_PENDING,
    CLOSING,
    CLOSED
}

interface CloseState {
    status: CloseStatus;
}

export default function LocPublicDataButton() {
    const { closeExtrinsic, close } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (closeState.status === CloseStatus.CLOSE_PENDING) {
            setCloseState({ status: CloseStatus.CLOSING });
            const signAndSubmit: SignAndSubmit = closeExtrinsic!();
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ closeExtrinsic, closeState, setCloseState ]);

    return (
        <>
            <Button
                onClick={ () => setCloseState({ status: CloseStatus.START }) }
            >
                Close LOC
            </Button>
            <ProcessStep
                active={ closeState.status === CloseStatus.START || closeState.status === CloseStatus.CLOSE_PENDING }
                title="Close this Case (1/2)"
                mayProceed={ closeState.status === CloseStatus.START }
                closeCallback={ () => setCloseState({ status: CloseStatus.NONE }) }
                proceedCallback={ () => setCloseState({ status: CloseStatus.CLOSE_PENDING }) }
            >
                <Alert variant="info">
                    <p>Warning: after processing and blockchain publication, this case cannot be opened again and therefore
                        will be completely sealed.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSING || closeState.status === CloseStatus.CLOSED }
                title="Close this Case (2/2)"
                mayProceed={ closeState.status === CloseStatus.CLOSED }
                proceedCallback={ () => setCloseState({ status: CloseStatus.NONE }) }
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        setCloseState({ status: CloseStatus.CLOSED })
                        close!()
                    } }
                    onError={ () => {
                    } } />
            </ProcessStep>
        </>
    )
}
