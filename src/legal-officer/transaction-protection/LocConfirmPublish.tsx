import Button from "../../common/Button";
import React, { useState, useEffect } from "react";
import { useLocContext } from "./LocContext";
import ExtrinsicSubmitter, { SignAndSubmit } from "../../ExtrinsicSubmitter";
import ProcessStep from "../ProcessStep";
import Alert from "../../common/Alert";

enum PublishStatus {
    NONE,
    START,
    PUBLISH_PENDING,
    PUBLISHING,
    PUBLISHED
}

interface PublishState {
    status: PublishStatus;
}

export interface Props {
    locItem: LocItem
}

export default function LocConfirmPublish(props: Props) {

    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const { publishMetadata, changeItemStatus } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (publishMetadata !== null && publishState.status === PublishStatus.PUBLISH_PENDING) {
            setPublishState({ status: PublishStatus.PUBLISHING });
            const signAndSubmit: SignAndSubmit = publishMetadata(props.locItem);
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ publishMetadata, publishState, setPublishState, props.locItem ])

    return (
        <>
            <Button onClick={ () => setPublishState({ status: PublishStatus.START }) }>Publish to the
                blockchain</Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START || publishState.status === PublishStatus.PUBLISH_PENDING }
                title="Publish Data (1/2)"
                mayProceed={ publishState.status === PublishStatus.START }
                closeCallback={ () => setPublishState({ status: PublishStatus.NONE }) }
                proceedCallback={ () => setPublishState({ status: PublishStatus.PUBLISH_PENDING }) }
            >
                <Alert variant="info">
                    <p>Warning: after processing and blockchain publication, these data will be definitely and publicly
                        available on the blockchain.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ publishState.status === PublishStatus.PUBLISHING || publishState.status === PublishStatus.PUBLISHED }
                title="Publish Data (2/2)"
                mayProceed={ publishState.status === PublishStatus.PUBLISHED }
                proceedCallback={ () => setPublishState({ status: PublishStatus.NONE }) }
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        setPublishState({ status: PublishStatus.PUBLISHED })
                        changeItemStatus!(props.locItem, 'PUBLISHED')
                    } }
                    onError={ () => {
                    } } />
            </ProcessStep>
        </>
    )
}
