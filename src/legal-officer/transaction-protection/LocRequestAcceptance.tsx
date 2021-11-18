import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';

import { useLogionChain } from '../../logion-chain';
import { UUID } from '../../logion-chain/UUID';
import { createLoc } from '../../logion-chain/LogionLoc';
import { useCommonContext } from '../../common/CommonContext';
import { LocRequest } from '../../common/types/ModelTypes';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { acceptLocRequest } from '../Model';
import ProcessStep from '../ProcessStep';

enum AcceptStatus {
    NONE,
    ACCEPTANCE_PENDING,
    ACCEPTING,
    ACCEPTED,
    LOC_CREATION_PENDING,
    CREATING_LOC,
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
    const { accounts, axiosFactory, refresh } = useCommonContext();

    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ error, setError ] = useState<boolean>(false);

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

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
                    requester: props.requestToAccept!.requesterAddress,
                    locType: 'Transaction',
                });
                setSignAndSubmit(() => signAndSubmit);
            };
            proceed();
        }
    }, [
        axiosFactory,
        acceptState,
        setStatus,
        setAcceptState,
        api,
        props.requestToAccept,
        accounts,
    ]);

    // Request acceptance (off-chain)
    useEffect(() => {
        if(acceptState.status === AcceptStatus.ACCEPTANCE_PENDING) {
            setStatus(AcceptStatus.ACCEPTING);
            (async function () {
                await acceptLocRequest(axiosFactory!(props.requestToAccept!.ownerAddress)!, { requestId: props.requestToAccept!.id });
                setStatus(AcceptStatus.ACCEPTED);
            })();
        }
    }, [ axiosFactory, acceptState, props.requestToAccept, setStatus ]);

    const close = useCallback(() => {
        setStatus(AcceptStatus.NONE);
        props.clearRequestToAccept();
    }, [ setStatus, props ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refresh();
    }, [ refresh, close ]);

    if(props.requestToAccept === null) {
        return null;
    }

    return (
        <div>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.NONE }
                closeCallback={ close }
                title="Accepting LOC request"
                mayProceed={ acceptState.status === AcceptStatus.NONE }
                proceedCallback={ () => setStatus(AcceptStatus.LOC_CREATION_PENDING) }
                stepTestId={ `modal-accepting-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-accept-${props.requestToAccept.id}` }
            >
                <Alert variant="info">
                    <p>You are about to create the LOC and accept the request</p>
                    <p>The LOC's creation will require your signature and may take several seconds.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.CREATING_LOC
                        || acceptState.status === AcceptStatus.ACCEPTANCE_PENDING
                        || acceptState.status === AcceptStatus.ACCEPTING
                        || acceptState.status === AcceptStatus.ACCEPTED }
                title="Creating LOC"
                mayProceed={ acceptState.status === AcceptStatus.ACCEPTED || error }
                proceedCallback={ () => error ? closeAndRefresh() : setStatus(AcceptStatus.DONE) }
                stepTestId={ `modal-creating-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-review-${props.requestToAccept.id}` }
            >
                <ExtrinsicSubmitter
                    id="metadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(AcceptStatus.ACCEPTANCE_PENDING) }
                    onError={ () => setError(true) }
                />
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.DONE }
                closeCallback={ closeAndRefresh }
                title="LOC opened"
                stepTestId={ `modal-review-${props.requestToAccept.id}` }
                closeButtonTestId={ `close-review-${props.requestToAccept.id}` }
            >
                <div>
                    <p>A LOC was successfully opened for request { props.requestToAccept.id }.</p>
                </div>
            </ProcessStep>
        </div>
    );
}
