import { Fees } from "@logion/node-api";
import Button from "../common/Button";
import { useState, useEffect } from "react";
import ProcessStep from "../legal-officer/ProcessStep";
import Alert from "../common/Alert";
import { PublishProps, PublishState, PublishStatus, documentClaimHistory } from "./LocItem";
import Icon from "../common/Icon";
import { useLocContext } from "./LocContext";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import LocPublicDataDetails from "./LocPublicDataDetails";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocLinkDetails from "./LocLinkDetails";
import { useCommonContext } from "src/common/CommonContext";
import LocItemEstimatedFees from "./LocItemEstimatedFees";

export default function LocPublishButton(props: PublishProps) {
    const { viewer } = useCommonContext();
    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const [ call, setCall ] = useState<Call>();
    const { mutateLocState, loc } = useLocContext();
    const [ fees, setFees ] = useState<Fees | undefined | null>();

    useEffect(() => {
        if (publishState.status === PublishStatus.PUBLISH_PENDING) {
            setPublishState({ status: PublishStatus.PUBLISHING });
            const call: Call = async (callback: CallCallback) =>
                mutateLocState(async current =>
                    props.publishMutator(current, callback));
            setCall(() => call);
        }
    }, [ props, publishState, setPublishState, mutateLocState ]);

    useEffect(() => {
        if(fees === undefined) {
            setFees(null);
            (async function() {
                setFees(await props.feesEstimator());
            })();
        }
    }, [ fees, props ]);

    return (
        <>
            <Button
                onClick={ () => setPublishState({ status: PublishStatus.START }) }
                variant="polkadot"
            >
                <Icon icon={{ id:"publish" }} height="20px" /> Publish
            </Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START || publishState.status === PublishStatus.PUBLISH_PENDING }
                nextSteps={[
                    {
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        id: 'cancel',
                        mayProceed: true,
                        callback: () => setPublishState({ status: PublishStatus.NONE })
                    },
                    {
                        buttonText: 'Publish',
                        buttonVariant: 'polkadot',
                        id: 'publish',
                        mayProceed: publishState.status === PublishStatus.START,
                        callback: () => setPublishState({ status: PublishStatus.PUBLISH_PENDING })
                    }
                ]}
            >
                <Icon icon={{id: "warning"}} height="50px"/><br/>
                <span><strong>Warning</strong></span>

                <p style={{ marginTop: "20px", marginBottom: "20px" }}>After processing and blockchain publication, these data will be definitely and publicly
                    available on the blockchain.</p>

                { props.locItem.type === 'Data' && <LocPublicDataDetails item={ props.locItem } /> }
                {
                    props.locItem.type === 'Document' &&
                    <LocPrivateFileDetails
                        item={ props.locItem }
                        documentClaimHistory={ loc?.locType === "Collection" && props.locItem.value && !props.locItem.template ? documentClaimHistory(viewer, loc, props.locItem.value) : undefined }
                        otherFeesPaidByRequester={ loc?.requesterLocId === undefined && loc?.sponsorshipId === undefined }
                    />
                }
                { props.locItem.type === 'Linked LOC' && <LocLinkDetails item={ props.locItem } /> }

                <LocItemEstimatedFees
                    fees={ fees }
                    locItem={ props.locItem }
                    centered={ true }
                />
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHING }
                hasSideEffect
            >
                <ClientExtrinsicSubmitter
                    call={ call }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        setPublishState({ status: PublishStatus.PUBLISHED })
                    } }
                    onError={ () => setPublishState({ status: PublishStatus.ERROR }) }
                />
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHED || publishState.status === PublishStatus.ERROR }
                nextSteps={[
                    {
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        id: 'ok',
                        mayProceed: true,
                        callback: () => setPublishState({ status: PublishStatus.NONE })
                    }
                ]}
            >
                {
                    publishState.status === PublishStatus.PUBLISHED &&
                    <Alert variant='polkadot'>
                        LOC {props.itemType} successfully published
                    </Alert>
                }
                {
                    publishState.status === PublishStatus.ERROR &&
                    <Alert variant='danger'>
                        Failed to publish {props.itemType}
                    </Alert>
                }
            </ProcessStep>
        </>
    )
}
