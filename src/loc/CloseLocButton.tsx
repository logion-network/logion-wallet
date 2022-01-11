import { useEffect, useState } from "react";
import Button from "../common/Button";
import ProcessStep from "../legal-officer/ProcessStep";
import Alert from "../common/Alert";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useCommonContext } from "../common/CommonContext";

import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";

import './CloseLocButton.css';

enum CloseStatus {
    NONE,
    START,
    CLOSE_PENDING,
    CLOSING,
    ERROR
}

interface CloseState {
    status: CloseStatus;
}

export default function CloseLocButton() {
    const { refresh } = useCommonContext();
    const { closeExtrinsic, close, locItems } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ disabled, setDisabled ] = useState<boolean>(false)

    useEffect(() => {
        if (closeState.status === CloseStatus.CLOSE_PENDING) {
            setCloseState({ status: CloseStatus.CLOSING });
            const signAndSubmit: SignAndSubmit = closeExtrinsic!();
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ closeExtrinsic, closeState, setCloseState ]);

    useEffect(() => {
        if (locItems.findIndex(locItem => locItem.status === "DRAFT") < 0) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [ locItems, setDisabled ])

    return (
        <div className="CloseLocButton">
            <Button
                onClick={ () => setCloseState({ status: CloseStatus.START }) }
                className="close"
                disabled={ disabled }
            >
                <Icon icon={{id: "lock"}} /><span className="text">Close LOC</span>
            </Button>
            <ProcessStep
                active={ closeState.status === CloseStatus.START || closeState.status === CloseStatus.CLOSE_PENDING }
                title="Close this Case (1/2)"
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: 'cancel',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: closeState.status === CloseStatus.START,
                        callback: () => setCloseState({ status: CloseStatus.CLOSE_PENDING })
                    }
                ]}
            >
                <Alert variant="info">
                    <p>Warning: after processing and blockchain publication, this case cannot be opened again and therefore
                        will be completely sealed.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSING }
                title="Close this Case (2/2)"
                nextSteps={[]}
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        setCloseState({ status: CloseStatus.NONE })
                        close!()
                        refresh!()
                    } }
                    onError={ () => setCloseState({ status: CloseStatus.ERROR }) }
                />
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.ERROR }
                title="Close this Case (2/2)"
                nextSteps={[
                    {
                        id: 'ok',
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    }
                ]}
            >
                <Alert variant="danger">
                    Could not close LOC.
                </Alert>
            </ProcessStep>
        </div>
    )
}
