import { useState, useCallback } from 'react';
import { LocData, PendingRequest, AcceptedRequest } from '@logion/client';
import { useLogionChain } from '../../logion-chain';
import ProcessStep from '../../common/ProcessStep';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useLocContext } from 'src/loc/LocContext';
import Alert from 'src/common/Alert';

export interface Props {
    requestToAccept: LocData | null,
    clearRequestToAccept: () => void,
}

export default function LocRequestAcceptance(props: Props) {
    const { signer, client } = useLogionChain();
    const { refreshLocs } = useLegalOfficerContext();
    const { mutateLocState } = useLocContext();
    const [ accepting, setAccepting ] = useState(false);
    const [ error, setError ] = useState<string>();

    const close = useCallback(() => {
        setError(undefined);
        setAccepting(false);
        props.clearRequestToAccept();
    }, [ props ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refreshLocs();
    }, [ close, refreshLocs ]);

    const accept = useCallback(async () => {
        setAccepting(true);
        try {
            await mutateLocState(async current => {
                if(client && signer && current instanceof PendingRequest) {
                    const accepted = await current.legalOfficer.accept({ signer });
                    if (accepted instanceof AcceptedRequest) {
                        closeAndRefresh();
                    }
                    setAccepting(false);
                    return accepted;
                } else {
                    return current;
                }
            });
        } catch(e) {
            setError("Could not accept: an error occured");
        }
    }, [
        mutateLocState,
        signer,
        client,
        closeAndRefresh,
    ]);

    if(props.requestToAccept === null) {
        return null;
    }

    let title;
    if(props.requestToAccept.locType === 'Transaction') {
        title = "Accepting Transaction Protection Request";
    } else if(props.requestToAccept.locType === 'Collection') {
        title = "Accepting Collection Protection Request";
    } else if(props.requestToAccept.locType === 'Identity') {
        title = "Accepting Identity Case Request";
    } else {
        throw new Error(`Unsupported LOC type ${props.requestToAccept.locType}`);
    }

    return (
        <div>
            <ProcessStep
                active={ props.requestToAccept !== null }
                title={ title }
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                        mayProceed: !accepting || error !== undefined,
                        callback: close,
                    },
                    {
                        id: 'accept',
                        buttonText: 'Accept',
                        buttonVariant: 'primary',
                        mayProceed: !accepting,
                        callback: accept,
                    }
                ]}
            >
                <p>You are about to accept the LOC request</p>
                {
                    error !== undefined &&
                    <Alert
                        variant="danger"
                    >
                        { error }
                    </Alert>
                }
            </ProcessStep>
        </div>
    );
}
