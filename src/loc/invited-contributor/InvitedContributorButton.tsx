import { useCallback, useState, useMemo } from "react";
import Button, { Action } from "../../common/Button";
import Dialog from "../../common/Dialog";
import { useCommonContext } from "../../common/CommonContext";
import { useLocContext } from "../LocContext";
import { ClosedCollectionLoc, OpenLoc } from "@logion/client";
import FormGroup from "../../common/FormGroup";
import { Form } from "react-bootstrap";
import { useLogionChain, CallCallback } from "../../logion-chain";
import ExtrinsicSubmissionStateView from "../../ExtrinsicSubmissionStateView";
import { ValidAccountId } from "@logion/node-api";
import Icon from "../../common/Icon";

export interface Props {
    removeContributor?: ValidAccountId
}

export function InvitedContributorButton(props: Props) {
    const { removeContributor } = props;
    const [ showDialog, setShowDialog ] = useState(false);
    const { mutateLocState } = useLocContext();
    const { colorTheme } = useCommonContext();
    const [ invitedContributor, setInvitedContributor ] = useState("");
    const { client, accounts, signer, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain()

    const isInvalid = useCallback(() => {
        if (!client) {
            return false;
        }
        return (!client.isValidAddress(invitedContributor) || invitedContributor === accounts!.current!.accountId.address)
    }, [ accounts, client, invitedContributor ])


    const start = useCallback((invitedContributor: string) => {
        clearSubmissionState();
        setInvitedContributor(invitedContributor);
        setShowDialog(true);
    }, [ clearSubmissionState ]);

    const close = useCallback(() => {
        setShowDialog(false);
        clearSubmissionState();
    }, [ clearSubmissionState ]);

    const call = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current => {
                if (signer && (current instanceof ClosedCollectionLoc || current instanceof OpenLoc)) {
                    return current.setInvitedContributor({
                        signer,
                        callback,
                        payload: {
                            invitedContributor,
                            selected: removeContributor === undefined,
                        }
                    })
                } else {
                    return current;
                }
            })
    }, [ mutateLocState, invitedContributor, signer, removeContributor ]);

    const actions = useMemo(() => {
        const actions: Action[] = [];
        if (!extrinsicSubmissionState.submitted) {
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
                disabled: isInvalid()
            });
        } else if (extrinsicSubmissionState.callEnded) {
            actions.push({
                id: "close",
                buttonText: "Close",
                buttonVariant: "primary",
                callback: close,
            });
        }
        return actions;
    }, [ close, submitCall, extrinsicSubmissionState, call, isInvalid ]);

    return (
        <>
            { removeContributor === undefined &&
                <Button onClick={ () => start("") }>
                    Add an invited contributor
                </Button>
            }
            { removeContributor !== undefined &&
                <Button onClick={ () => start(removeContributor.address) } variant="danger-flat">
                    <Icon icon={ { id: 'trash' } } />
                </Button>
            }
            <Dialog
                show={ showDialog }
                actions={ actions }
                size={ "lg" }
            >
                { removeContributor === undefined &&
                    <p>Add a new invited contributor</p>
                }
                { removeContributor !== undefined &&
                    <p>Remove an invited contributor</p>
                }
                <FormGroup
                    id="address"
                    label="Address"
                    control={ <Form.Control
                        isInvalid={ invitedContributor !== "" && isInvalid() }
                        type="text"
                        placeholder="The invited contributor's SS58 address"
                        value={ invitedContributor }
                        onChange={ value => setInvitedContributor(value.target.value) }
                        readOnly={ removeContributor !== undefined }
                    /> }
                    colors={ colorTheme.dialog }
                />
                <ExtrinsicSubmissionStateView
                    successMessage={ `Invited Contributor successfully ${ removeContributor ? "removed from" : "added to"} Collection` }
                />
            </Dialog>
        </>
    )
}
