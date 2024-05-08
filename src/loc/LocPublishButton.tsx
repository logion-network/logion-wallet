import { Fees } from "@logion/node-api";
import Button from "../common/Button";
import { useState, useEffect, useMemo, useCallback } from "react";
import ProcessStep from "../common/ProcessStep";
import { PublishProps, PublishState, PublishStatus, LinkItem, FileItem, MetadataItem } from "./LocItem";
import Icon from "../common/Icon";
import { useLocContext } from "./LocContext";
import LocPublicDataDetails from "./LocPublicDataDetails";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocLinkDetails from "./LocLinkDetails";
import LocItemEstimatedFees from "./LocItemEstimatedFees";
import { CallCallback, useLogionChain } from "src/logion-chain";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

export default function LocPublishButton(props: PublishProps) {
    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const { mutateLocState, loc } = useLocContext();
    const [ fees, setFees ] = useState<Fees | undefined | null>();
    const { submitCall, clearSubmissionState } = useLogionChain();

    const call = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current =>
                props.publishMutator(current, callback));
    }, [ mutateLocState, props ]);

    const publish = useCallback(async () => {
        setPublishState({ status: PublishStatus.PUBLISHING });
        try {
            await submitCall(call);
        } catch(e) {
            console.log(e);
        } finally {
            setPublishState({ status: PublishStatus.DONE });
        }
    }, [ submitCall, call ]);

    useEffect(() => {
        if(fees === undefined && props.locItem.status === "REVIEW_ACCEPTED") {
            setFees(null);
            (async function() {
                setFees(await props.feesEstimator());
            })();
        }
    }, [ fees, props ]);

    const cancel = useCallback(async () => {
        clearSubmissionState();
        setPublishState({ status: PublishStatus.NONE });
    }, [ clearSubmissionState ]);

    return (
        <>
            <Button
                onClick={ () => setPublishState({ status: PublishStatus.START }) }
                variant="polkadot"
            >
                <Icon icon={{ id:"publish" }} height="20px" /> Publish
            </Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START }
                nextSteps={[
                    {
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        id: 'cancel',
                        mayProceed: true,
                        callback: cancel,
                    },
                    {
                        buttonText: 'Publish',
                        buttonVariant: 'polkadot',
                        id: 'publish',
                        mayProceed: publishState.status === PublishStatus.START,
                        callback: publish,
                    }
                ]}
            >
                <Icon icon={{id: "warning"}} height="50px"/><br/>
                <span><strong>Warning</strong></span>

                <p style={{ marginTop: "20px", marginBottom: "20px" }}>After processing and blockchain publication, these data will be definitely and publicly
                    available on the blockchain.</p>

                { props.locItem.type === 'Data' && <LocPublicDataDetails item={ props.locItem as MetadataItem } /> }
                {
                    props.locItem.type === 'Document' &&
                    <LocPrivateFileDetails
                        item={ props.locItem as FileItem }
                        otherFeesPaidByRequester={ loc?.requesterLocId === undefined && loc?.sponsorshipId === undefined }
                    />
                }
                { props.locItem.type === 'Linked LOC' && <LocLinkDetails item={ props.locItem as LinkItem } /> }

                <LocItemEstimatedFees
                    fees={ fees }
                    locItem={ props.locItem }
                    centered={ true }
                />
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHING || publishState.status === PublishStatus.DONE }
                title={ `Publish ${props.itemType} (1/2)` }
                nextSteps={[
                    {
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        id: 'ok',
                        mayProceed: publishState.status === PublishStatus.DONE,
                        callback: cancel,
                    }
                ]}
            >
                <ExtrinsicSubmissionStateView
                    successMessage="LOC item successfully published"
                />
            </ProcessStep>
        </>
    )
}
