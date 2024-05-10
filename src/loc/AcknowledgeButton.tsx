import { OpenLoc } from "@logion/client";
import { Fees } from "@logion/node-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button, { Action } from "src/common/Button";
import Icon from "src/common/Icon";
import { LocItem, MetadataData, FileData, LinkData } from "./LocItem";
import Dialog from "src/common/Dialog";
import EstimatedFees from "./fees/EstimatedFees";
import { useLocContext } from "./LocContext";
import Alert from "src/common/Alert";
import { useLogionChain, CallCallback } from "src/logion-chain";
import "./AcknowledgeButton.css";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

export interface Props {
    locItem: LocItem;
}

export default function AcknowledgeButton(props: Props) {
    const [ showDialog, setShowDialog ] = useState(false);
    const [ fees, setFees ] = useState<Fees | undefined | null>();
    const { mutateLocState, locState } = useLocContext();
    const { signer, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();

    useEffect(() => {
        if(fees === undefined) {
            setFees(null);
            (async function() {
                let fees: Fees;
                if(locState instanceof OpenLoc) {
                    if(props.locItem.type === "Data") {
                        fees = await locState.legalOfficer.estimateFeesAcknowledgeMetadata({
                            nameHash: props.locItem.as<MetadataData>().name.hash,
                        })
                    } else if(props.locItem.type === "Document") {
                        fees = await locState.legalOfficer.estimateFeesAcknowledgeFile({
                            hash: props.locItem.as<FileData>().hash,
                        })
                    } else if(props.locItem.type === "Linked LOC") {
                        fees = await locState.legalOfficer.estimateFeesAcknowledgeLink({
                            target: props.locItem.as<LinkData>().linkedLoc.id,
                        })
                    } else {
                        throw new Error("Unexpected type");
                    }
                    setFees(fees);
                }
            })();
        }
    }, [ fees, props.locItem, locState ]);

    const preview = useCallback(() => {
        setShowDialog(true);
    }, []);

    const close = useCallback(() => {
        setShowDialog(false);
        clearSubmissionState();
    }, [ clearSubmissionState ]);

    const call = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current => {
            if(signer && current instanceof OpenLoc) {
                if(props.locItem.type === "Document") {
                    return current.legalOfficer.acknowledgeFile({
                        payload: {
                            hash: props.locItem.as<FileData>().hash,
                        },
                        signer,
                        callback,
                    });
                } else if(props.locItem.type === "Data") {
                    return current.legalOfficer.acknowledgeMetadata({
                        payload: {
                            nameHash: props.locItem.as<MetadataData>().name.hash,
                        },
                        signer,
                        callback,
                    });
                } else if(props.locItem.type === "Linked LOC") {
                    return current.legalOfficer.acknowledgeLink({
                        payload: {
                            target: props.locItem.as<LinkData>().linkedLoc.id,
                        },
                        signer,
                        callback,
                    });
                } else {
                    throw new Error("Unexpected type");
                }
            } else {
                return current;
            }
        });
    }, [ mutateLocState, props.locItem, signer ]);

    const actions = useMemo(() => {
        const actions: Action[] = [];
        if(!extrinsicSubmissionState.submitted) {
            actions.push({
                id: "cancel",
                buttonText: "Cancel",
                buttonVariant: "secondary",
                callback: close,
            });
            actions.push({
                id: "proceed",
                buttonText: "Proceed",
                buttonVariant: "polkadot",
                callback: () => submitCall(call),
            });
        } else if(extrinsicSubmissionState.callEnded) {
            actions.push({
                id: "close",
                buttonText: "Close",
                buttonVariant: "primary",
                callback: close,
            });
        }
        return actions;
    }, [ close, submitCall, extrinsicSubmissionState, call ]);

    return (
        <>
            <Button
                variant="polkadot"
                onClick={ preview }
                disabled={ props.locItem.timestamp === null }
            >
                <Icon icon={{ id: "shield" }} /> Acknowledge
            </Button>
            <Dialog
                show={ showDialog }
                actions={ actions }
                size="lg"
                className="AcknowledgeButton"
            >
                <h3>{ `Acknowledge ${props.locItem.type}` }</h3>
                <Alert variant="info">
                    <p>Warning: after acknowledging this publication, these data will be definitely and publicly
                        available on the logion certificate.</p>
                </Alert>
                <EstimatedFees
                    fees={ fees }
                    centered={ true }
                />
                <div className="submitter-container">
                    <ExtrinsicSubmissionStateView
                        successMessage="Successfully acknowledged"
                    />
                </div>
            </Dialog>
        </>
    );
}
