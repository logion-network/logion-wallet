import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';

import { useLogionChain } from '../logion-chain';
import { UUID } from '../logion-chain/UUID';
import { createLoc } from '../logion-chain/LogionLoc';
import { useCommonContext } from '../common/CommonContext';

import { LocRequest } from '../common/types/ModelTypes';
import { acceptLocRequest } from './Model';
import ProcessStep from './ProcessStep';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';

enum AcceptStatus {
    NONE,
    ACCEPTANCE_PENDING,
    ACCEPTING,
    ACCEPTED,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    LOC_CREATED,
    DONE
}

interface AcceptState {
    status: AcceptStatus;
}

export interface Props {
    requestToAccept: LocRequest | null,
    clearRequestToAccept: () => void,
}

export default function LocRequestAcceptance(props: Props) {
    const { api } = useLogionChain();
    const { accounts, axios, refresh } = useCommonContext();

    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    // Request acceptance (off-chain)
    useEffect(() => {
        if(acceptState.status === AcceptStatus.ACCEPTANCE_PENDING) {
            setStatus(AcceptStatus.ACCEPTING);
            (async function () {
                await acceptLocRequest(axios!, { requestId: props.requestToAccept!.id });
                setStatus(AcceptStatus.ACCEPTED);
            })();
        }
    }, [ axios, acceptState, props.requestToAccept, setStatus ]);

    // LOC creation
    useEffect(() => {
        if(acceptState.status === AcceptStatus.LOC_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_LOC);
            const proceed = async () => {
                const signAndSubmit: SignAndSubmit = (setResult, setError) => createLoc({
                    api: api!,
                    signerId: accounts!.current!.address,
                    callback: setResult,
                    errorCallback: setError,
                    locId: new UUID(props.requestToAccept!.id),
                });
                setSignAndSubmit(() => signAndSubmit);
            };
            proceed();
        }
    }, [
        axios,
        acceptState,
        setStatus,
        setAcceptState,
        api,
        props.requestToAccept,
        accounts,
    ]);

    const closeAndRefresh = useCallback(() => {
        refresh();
        props.clearRequestToAccept();
    }, [ refresh, props ]);

    const cancel = useCallback(() => {
        setStatus(AcceptStatus.NONE);
        props.clearRequestToAccept();
    }, [ setStatus, props ]);

    if(props.requestToAccept === null) {
        return null;
    }

    return (
        <div>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.NONE
                            || acceptState.status === AcceptStatus.ACCEPTANCE_PENDING
                            || acceptState.status === AcceptStatus.ACCEPTING }
                closeCallback={ cancel }
                title={ `Accept LOC request ${props.requestToAccept.id}` }
                mayProceed={ acceptState.status === AcceptStatus.NONE }
                proceedCallback={ () => setStatus(AcceptStatus.ACCEPTANCE_PENDING) }
                stepTestId={ `modal-accepting-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-accept-${props.requestToAccept.id}` }
            >
                <Alert variant="info">
                    <p>You are about to execute the following steps:</p>
                    <ol>
                        <li>accept the request</li>
                        <li>create the LOC</li>
                    </ol>
                    <p>The last step will require your signature and may take several seconds.</p>
                </Alert>
                <Alert variant="warning">
                    <p>Once started, the process has to be completed with no interruption.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.ACCEPTED }
                title={ `Creation LOC for request ${props.requestToAccept.id}` }
                mayProceed={ true }
                proceedCallback={ () => setStatus(AcceptStatus.LOC_CREATION_PENDING) }
                stepTestId={`modal-accepted-${props.requestToAccept.id}`}
                proceedButtonTestId={`proceed-create-${props.requestToAccept.id}`}
            >
                <Alert variant="success">
                    <p>Request successfully accepted, you may now proceed with creating the LOC.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.CREATING_LOC || acceptState.status === AcceptStatus.LOC_CREATED }
                title={ `Creating LOC for request ${props.requestToAccept.id}` }
                mayProceed={ acceptState.status === AcceptStatus.LOC_CREATED }
                proceedCallback={ () => setStatus(AcceptStatus.DONE) }
                stepTestId={ `modal-creating-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-review-${props.requestToAccept.id}` }
            >
                <ExtrinsicSubmitter
                    id="metadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(AcceptStatus.LOC_CREATED) }
                    onError={ () => {} }
                />
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.DONE }
                closeCallback={ closeAndRefresh }
                title={ `LOC request ${props.requestToAccept.id}`}
                stepTestId={ `modal-review-${props.requestToAccept.id}` }
                closeButtonTestId={ `close-review-${props.requestToAccept.id}` }
            >
                <div>
                    <p>LOC was successfully created for request { props.requestToAccept.id }.</p>
                </div>
            </ProcessStep>
        </div>
    );
}
