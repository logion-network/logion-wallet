import Button from "../../common/Button";
import React, { useState, useEffect } from "react";
import { useLocContext } from "./LocContext";
import ExtrinsicSubmitter, { SignAndSubmit } from "../../ExtrinsicSubmitter";
import ProcessStep from "../ProcessStep";
import Alert from "../../common/Alert";
import { PublishProps, PublishState, PublishStatus } from "./types";

export default function LocPublishLinkButton(props: PublishProps) {

    const [ publishState, setPublishState ] = useState<PublishState>({ status: PublishStatus.NONE });
    const { publishLink, confirmLink } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (publishLink !== null && publishState.status === PublishStatus.PUBLISH_PENDING) {
            setPublishState({ status: PublishStatus.PUBLISHING });
            const signAndSubmit: SignAndSubmit = publishLink(props.locItem)
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ publishLink, publishState, setPublishState, props.locItem ])

    return (
        <>
            <Button
                onClick={ () => setPublishState({ status: PublishStatus.START }) }
                variant="polkadot"
            >
                Publish to the blockchain
            </Button>
            <ProcessStep
                active={ publishState.status === PublishStatus.START || publishState.status === PublishStatus.PUBLISH_PENDING }
                title="Publish Link (1/2)"
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
                title="Publish Link (2/2)"
                mayProceed={ publishState.status === PublishStatus.PUBLISHED }
                proceedCallback={ () => setPublishState({ status: PublishStatus.NONE }) }
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC public data successfully published"
                    onSuccess={ () => {
                        confirmLink!(props.locItem)
                        setPublishState({ status: PublishStatus.PUBLISHED })
                    } }
                    onError={ () => {
                    } } />
            </ProcessStep>
        </>
    )
}
