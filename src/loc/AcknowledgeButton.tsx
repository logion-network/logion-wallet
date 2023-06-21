import { OpenLoc } from "@logion/client";
import { Fees, UUID } from "@logion/node-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button, { Action } from "src/common/Button";
import Icon from "src/common/Icon";
import { LocItem } from "./LocItem";
import Dialog from "src/common/Dialog";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import EstimatedFees from "./fees/EstimatedFees";
import { useLocContext } from "./LocContext";
import Alert from "src/common/Alert";
import { useLogionChain } from "src/logion-chain";
import "./AcknowledgeButton.css";

export interface Props {
    locId: UUID;
    locItem: LocItem;
}

enum State {
    INIT,
    PREVIEW,
    ACKNOWLEDGING,
    ACKNOWLEDGED,
    ERROR,
}

export default function AcknowledgeButton(props: Props) {
    const [ state, setState ] = useState(State.INIT);
    const [ fees, setFees ] = useState<Fees | undefined | null>();
    const [ call, setCall ] = useState<Call>();
    const { mutateLocState } = useLocContext();
    const { client, signer } = useLogionChain();

    useEffect(() => {
        if(fees === undefined && client) {
            setFees(null);
            (async function() {
                let fees: Fees;
                if(props.locItem.type === "Data") {
                    fees = await client.logionApi.fees.estimateWithoutStorage({
                        origin: client.currentAddress?.address || "",
                        submittable: client.logionApi.polkadot.tx.logionLoc.acknowledgeMetadata(
                            client.logionApi.adapters.toLocId(props.locId),
                            props.locItem.name || "",
                        ),
                    });
                } else if(props.locItem.type === "Document") {
                    fees = await client.logionApi.fees.estimateWithoutStorage({
                        origin: client.currentAddress?.address || "",
                        submittable: client.logionApi.polkadot.tx.logionLoc.acknowledgeFile(
                            client.logionApi.adapters.toLocId(props.locId),
                            props.locItem.value || "",
                        ),
                    });
                } else {
                    throw new Error("Unexpected type");
                }
                setFees(fees);
            })();
        }
    }, [ fees, client, props.locItem, props.locId ]);

    const preview = useCallback(() => {
        setState(State.PREVIEW);
    }, []);

    const close = useCallback(() => {
        setState(State.INIT);
    }, []);

    const acknowledge = useCallback(async () => {
        setState(State.ACKNOWLEDGING);
        const call = async (callback: CallCallback) =>
            mutateLocState(async current => {
                if(signer && current instanceof OpenLoc) {
                    if(props.locItem.type === "Document") {
                        return current.legalOfficer.acknowledgeFile({
                            hash: props.locItem.hash!,
                            signer,
                            callback,
                        });
                    } else if(props.locItem.type === "Data") {
                        return current.legalOfficer.acknowledgeMetadata({
                            nameHash: props.locItem.hash!,
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
        setCall(() => call);
    }, [ mutateLocState, signer, props.locItem ]);

    const actions = useMemo(() => {
        const actions: Action[] = [];
        if(state === State.PREVIEW || state === State.ERROR) {
            actions.push({
                id: "cancel",
                buttonText: "Cancel",
                buttonVariant: "secondary",
                callback: close,
            });
        }
        if(state === State.PREVIEW) {
            actions.push({
                id: "proceed",
                buttonText: "Proceed",
                buttonVariant: "polkadot",
                callback: acknowledge,
            });
        }
        if(state === State.ACKNOWLEDGED) {
            actions.push({
                id: "close",
                buttonText: "Close",
                buttonVariant: "primary",
                callback: close,
            });
        }
        return actions;
    }, [ state, close, acknowledge ]);

    return (
        <>
            <Button
                variant="polkadot"
                onClick={ preview }
            >
                <Icon icon={{ id: "shield" }} /> Acknowledge
            </Button>
            <Dialog
                show={ state !== State.INIT }
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
                    <ClientExtrinsicSubmitter
                        call={ call }
                        successMessage="Successfully acknowledged"
                        onSuccess={ () => setState(State.ACKNOWLEDGED) }
                        onError={ () => setState(State.ERROR) }
                    />
                </div>
            </Dialog>
        </>
    );
}
