import Button from "../../common/Button";
import React, { useState, useEffect } from "react";
import { useLocContext } from "./LocContext";
import ExtrinsicSubmitter, { SignAndSubmit } from "../../ExtrinsicSubmitter";
import ProcessStep from "../ProcessStep";
import Alert from "../../common/Alert";
import { PublishProps, PublishState, PublishStatus } from "./types";
import Icon from "../../common/Icon";

export default function LocPublishPrivateFileButton(props: PublishProps) {

    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const { publishFile, confirmFile } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (publishFile !== null && publishState.status === PublishStatus.PUBLISH_PENDING) {
            setPublishState({ status: PublishStatus.PUBLISHING });
            const signAndSubmit: SignAndSubmit = publishFile(props.locItem);
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ publishFile, publishState, setPublishState, props.locItem ])

    return (
        <>
            <Button
                onClick={ () => setPublishState({ status: PublishStatus.START }) }
                variant="polkadot"
            >
                <Icon icon={{ id:"publish" }} /> Publish to the blockchain
            </Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START || publishState.status === PublishStatus.PUBLISH_PENDING }
                title="Publish Document related Data (1/2)"
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
                    <p>Warning: after processing and blockchain publication, these document related data - but not the
                        document itself - will be definitely and publicly available on the blockchain.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHING || publishState.status === PublishStatus.PUBLISHED }
                title="Publish Document related Data (2/2)"
                nextSteps={[
                    {
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        id: 'ok',
                        mayProceed: publishState.status === PublishStatus.PUBLISHED,
                        callback: () => setPublishState({ status: PublishStatus.NONE })
                    }
                ]}
            >
                <ExtrinsicSubmitter
                    id="publishFile"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC document related data successfully published"
                    onSuccess={ () => {
                        confirmFile!(props.locItem)
                        setPublishState({ status: PublishStatus.PUBLISHED })
                    } }
                    onError={ () => {
                    } } />
            </ProcessStep>
        </>
    )
}
