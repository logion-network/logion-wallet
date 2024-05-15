import { ClosedIdentityLoc } from "@logion/client";
import { useCallback, useState } from "react";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import Button from "src/common/Button";
import Dialog from "src/common/Dialog";
import Icon from "src/common/Icon";
import Select from "src/common/Select";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";

export default function RequestVoteButton() {
    const { signer } = useLogionChain();
    const { locState } = useLocContext();
    const [ submissionInProgress, setSubmissionInProgress ] = useState<boolean>(false);
    const [ call, setCall ] = useState<Call>();
    const [ voteId, setVoteId ] = useState<string>();
    const [ showSuccessDialog, setShowSuccessDialog ] = useState(false);
    const [ submissionFailed, setSubmissionFailed ] = useState<boolean>(false);

    const requestVoteCallback = useCallback(async (callback: CallCallback) => {
        if(signer && (locState instanceof ClosedIdentityLoc)) {
            const requestedVoteId = await locState.legalOfficer.requestVote({
                callback,
                signer,
            });
            setVoteId(requestedVoteId);
        } else {
            throw new Error("Unexpected state");
        }
    }, [ signer, locState ]);

    const completeOnSuccessCallback = useCallback(() => {
        setSubmissionInProgress(false);
        setCall(undefined);
        setShowSuccessDialog(true);
    }, []);

    const completeOnFailureCallback = useCallback(() => {
        setSubmissionInProgress(false);
        setCall(undefined);
        setSubmissionFailed(false);
    }, []);

    return (
        <div>
            <Button
                onClick={ () => setSubmissionInProgress(true) }
                disabled={ call !== undefined }
            >
                <Icon icon={{id: "vote"}} /> Request a vote
            </Button>
            {
                submissionInProgress &&
                <Dialog
                    show={ true }
                    size="lg"
                    actions={[
                        {
                            id: "close",
                            buttonText: "Close",
                            buttonVariant: "primary",
                            callback: completeOnFailureCallback,
                            disabled: call !== undefined && !submissionFailed
                        },
                        {
                            id: "requestVote",
                            buttonText: "Request a vote",
                            buttonVariant: "polkadot",
                            callback: () => setCall(() => requestVoteCallback),
                            disabled: call !== undefined,
                        }
                    ]}
                >
                    <h3>Request a vote</h3>
                    {
                        call === undefined && <>
                            <p>You are about to request a vote on this closed LOC. <strong>All voters will then have access
                                to the content of this LOC, including the confidential documents.</strong> Please make
                                sure that this is actually what you want.
                            </p>
                            <Select
                                options={ [
                                    {
                                        label: "Non-Collator Logion Legal Officer nomination vote",
                                        value: "guest-lo"
                                    }
                                ] }
                                onChange={ () => {
                                } }
                                value="guest-lo"
                            />
                        </>
                    }
                    <ClientExtrinsicSubmitter
                        call={ call }
                        onSuccess={ () => completeOnSuccessCallback() }
                        onError={ () => setSubmissionFailed(true) }
                    />
                </Dialog>
            }
            <Dialog
                show={ showSuccessDialog }
                size="lg"
                actions={[
                    {
                        id: "close",
                        buttonText: "Close",
                        buttonVariant: "primary",
                        callback: () => setShowSuccessDialog(false),
                    }
                ]}
            >
                <h3>Vote requested successfully</h3>
                <p>A vote with ID <strong>{ voteId }</strong> was succesfully created and made available to all voters. It may take up to a dozen of seconds before actually showing up in voters' dashboard, including yours.</p>
            </Dialog>
        </div>
    );
}
