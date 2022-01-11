import Button from "../common/Button";
import React, { useState, useEffect } from "react";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import ProcessStep from "../legal-officer/ProcessStep";
import Alert from "../common/Alert";
import { PublishProps, PublishState, PublishStatus } from "./types";
import Icon from "../common/Icon";

export default function LocPublishButton(props: PublishProps) {
    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (props.signAndSubmitFactory !== null && publishState.status === PublishStatus.PUBLISH_PENDING) {
            setPublishState({ status: PublishStatus.PUBLISHING });
            const signAndSubmit: SignAndSubmit = props.signAndSubmitFactory(props.locItem)
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ props, publishState, setPublishState ])

    return (
        <>
            <Button
                onClick={ () => setPublishState({ status: PublishStatus.START }) }
                variant="polkadot"
            >
                <Icon icon={{ id:"publish" }} height="20px" /> Publish to the blockchain
            </Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START || publishState.status === PublishStatus.PUBLISH_PENDING }
                title={ `Publish ${props.itemType} (1/2)` }
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
                <Alert variant="info">
                    <p>Warning: after processing and blockchain publication, these data will be definitely and publicly
                        available on the blockchain.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHING }
                title={ `Publish ${props.itemType} (2/2)` }
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        props.confirm!(props.locItem)
                        setPublishState({ status: PublishStatus.PUBLISHED })
                    } }
                    onError={ () => setPublishState({ status: PublishStatus.ERROR }) } />
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHED || publishState.status === PublishStatus.ERROR }
                title={ `Publish ${props.itemType} (2/2)` }
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
