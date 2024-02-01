import { useCallback, useMemo, useState } from "react";
import { OpenLoc } from "@logion/client";

import Button from "../common/Button";
import ProcessStep from "../common/ProcessStep";
import Alert from "../common/Alert";

import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";

import { useLogionChain, CallCallback } from "../logion-chain";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

import './CloseLocButton.css';
import Checkbox from "src/components/toggle/Checkbox";

enum CloseStatus {
    NONE,
    CLOSE_PENDING,
    CLOSING
}

interface CloseState {
    status: CloseStatus;
}

export default function CloseLocButton() {
    const { signer, submitCall, extrinsicSubmissionState, clearSubmissionState } = useLogionChain();
    const { mutateLocState,locItems, loc, locState } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ autoAck, setAutoAck ] = useState(false);

    const closeCall = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current => {
                if(signer && current instanceof OpenLoc) {
                    return current.legalOfficer.close({
                        autoAck,
                        signer,
                        callback,
                    });
                } else {
                    return current;
                }
            });
    }, [ mutateLocState, autoAck, signer ]);

    const close = useCallback(async () => {
        setCloseState({ status: CloseStatus.CLOSING });
        try {
            await submitCall(closeCall);
        } catch(e) {}
    }, [ closeCall, submitCall ]);

    const clear = useCallback(() => {
        clearSubmissionState();
        setCloseState({ status: CloseStatus.NONE });
    }, [ clearSubmissionState]);

    const canAutoAck = useMemo(() => {
        if(locState instanceof OpenLoc) {
            return locItems.length > 0 && locState.legalOfficer.canAutoAck();
        } else {
            return false;
        }
    }, [ locItems, locState ]);

    const canClose = useMemo(() => {
        if(locState instanceof OpenLoc) {
            return locState.legalOfficer.canClose(autoAck);
        } else {
            return false;
        }
    }, [ locState, autoAck ]);

    if(!loc) {
        return null;
    }

    const seal = loc.seal;
    const locType = loc.locType;

    return (
        <div className="CloseLocButton">
            {
                loc.status === "OPEN" &&
                <div className="toggle-button-container">
                    <div className="toggle-container">
                        <p>Acknowledge all?</p>
                        <Checkbox
                            skin="Toggle black"
                            checked={ autoAck }
                            setChecked={ (value) => setAutoAck(value) }
                            disabled={ !canAutoAck }
                        />
                    </div>
                    <div className="button-container">
                        <Button
                            onClick={ () => setCloseState({ status: CloseStatus.CLOSE_PENDING }) }
                            className="close"
                            disabled={ !canClose }
                        >
                            <Icon icon={{ id: "lock" }} height="19px" /><span className="text">Close LOC</span>
                        </Button>
                    </div>
                </div>
            }
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSE_PENDING }
                title={ locType !== "Identity" ? "Close this Case (1/2)" : "Close this Identity Case (1/2)" }
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: 'proceed',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: true,
                        callback: close,
                    }
                ]}
            >
                <Alert variant="info">
                    { locType !== "Identity" &&
                        <p>Warning: after processing and blockchain publication, this case cannot be opened again and
                            therefore will be completely sealed.</p>
                    }
                    { locType === "Identity" &&
                        <>
                            <p>Closing this Identity LOC will add a HASH of all identity records in the LOC. This HASH
                                will be published and publicly available in the current LOC as follow, proving - without
                                revealing related records - the identity verification due diligence you executed:</p>
                            <p><strong>Verified identity records existence proof:</strong></p>
                            <p>{ seal }</p>
                            <p>Warning: after processing and blockchain publication, this case cannot be opened again
                                and therefore will be completely sealed.</p>
                        </>
                    }
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSING }
                title="Close this Case (2/2)"
                nextSteps={ extrinsicSubmissionState.callEnded ? [
                    {
                        buttonText: "Close",
                        buttonVariant: "primary",
                        id: "close",
                        mayProceed: true,
                        callback: clear,
                    }
                ] : [] }
                hasSideEffect={ !extrinsicSubmissionState.callEnded }
            >
                <ExtrinsicSubmissionStateView />
            </ProcessStep>
        </div>
    )
}
