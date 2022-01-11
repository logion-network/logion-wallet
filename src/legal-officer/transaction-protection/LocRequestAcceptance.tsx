import React, { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../../logion-chain';
import { UUID } from '../../logion-chain/UUID';
import { createPolkadotTransactionLoc } from '../../logion-chain/LogionLoc';
import { useCommonContext } from '../../common/CommonContext';
import { LocRequest } from '../../common/types/ModelTypes';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { acceptLocRequest } from '../../loc/Model';
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
                const signAndSubmit: SignAndSubmit = (setResult, setError) => createPolkadotTransactionLoc({
                    api: api!,
                    signerId: accounts!.current!.address,
                    callback: setResult,
                    errorCallback: setError,
                    locId: new UUID(props.requestToAccept!.id),
                    requester: props.requestToAccept!.requesterAddress!,
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
                title="Accepting LOC request"
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: close,
                    },
                    {
                        id: 'reject',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: acceptState.status === AcceptStatus.NONE,
                        callback: () => setStatus(AcceptStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                <p>You are about to create the LOC and accept the request</p>
                <p>The LOC's creation will require your signature and may take several seconds.</p>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.CREATING_LOC
                        || acceptState.status === AcceptStatus.ACCEPTANCE_PENDING
                        || acceptState.status === AcceptStatus.ACCEPTING
                        || acceptState.status === AcceptStatus.ACCEPTED }
                title="Creating LOC"
                nextSteps={[
                    {
                        id: 'close',
                        buttonText: 'Close',
                        buttonVariant: 'primary',
                        mayProceed: acceptState.status === AcceptStatus.ACCEPTED || error,
                        callback: () => { closeAndRefresh() ; setStatus(AcceptStatus.DONE) },
                    }
                ]}
            >
                <ExtrinsicSubmitter
                    id="metadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(AcceptStatus.ACCEPTANCE_PENDING) }
                    onError={ () => setError(true) }
                />
            </ProcessStep>
        </div>
    );
}
