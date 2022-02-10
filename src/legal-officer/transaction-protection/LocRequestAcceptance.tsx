import { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../../logion-chain';
import { UUID } from '../../logion-chain/UUID';
import { createCollectionLoc, createPolkadotTransactionLoc } from '../../logion-chain/LogionLoc';
import { useCommonContext } from '../../common/CommonContext';
import { LocRequest } from '../../common/types/ModelTypes';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { acceptLocRequest } from '../../loc/Model';
import ProcessStep from '../ProcessStep';

import { ChainTime } from '../../logion-chain/ChainTime';
import CollectionLocMessage from '../../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../../loc/CollectionLimitsForm';

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
    const { accounts, axiosFactory, refresh, colorTheme } = useCommonContext();

    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ error, setError ] = useState<boolean>(false);

    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    // LOC creation
    useEffect(() => {
        if(acceptState.status === AcceptStatus.LOC_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_LOC);
            (async function() {
                let signAndSubmit: SignAndSubmit;
                if(props.requestToAccept?.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => createPolkadotTransactionLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(props.requestToAccept!.id),
                        requester: props.requestToAccept!.requesterAddress!,
                    });
                } else if(props.requestToAccept?.locType === 'Collection') {
                    let lastBlock: string | undefined;
                    if(limits.hasDateLimit) {
                        const now = await ChainTime.now(api!);
                        const atDateLimit = await now.atDate(new Date(limits.dateLimit));
                        lastBlock = atDateLimit.currentBlock.toString();
                    }

                    let maxSize: string | undefined;
                    if(limits.hasDataNumberLimit) {
                        maxSize = limits.dataNumberLimit;
                    }
                    signAndSubmit = (setResult, setError) => createCollectionLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(props.requestToAccept!.id),
                        requester: props.requestToAccept!.requesterAddress!,
                        lastBlock,
                        maxSize
                    });
                } else {
                    throw new Error(`Unsupported LOC type ${props.requestToAccept?.locType}`);
                }

                setSignAndSubmit(() => signAndSubmit);
            })();
        }
    }, [
        axiosFactory,
        acceptState,
        setStatus,
        setAcceptState,
        api,
        props.requestToAccept,
        accounts,
        limits,
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

    const resetFields = useCallback(() => {
        setLimits(DEFAULT_LIMITS);
    }, [ setLimits ]);

    const close = useCallback(() => {
        setStatus(AcceptStatus.NONE);
        resetFields();
        props.clearRequestToAccept();
    }, [ setStatus, props, resetFields ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refresh();
    }, [ refresh, close ]);

    if(props.requestToAccept === null) {
        return null;
    }

    let title;
    if(props.requestToAccept.locType === 'Transaction') {
        title = "Accepting Transaction Protection Request";
    } else if(props.requestToAccept.locType === 'Collection') {
        title = "Accepting Collection Protection Request";
    } else {
        throw new Error(`Unsupported LOC type ${props.requestToAccept.locType}`);
    }

    return (
        <div>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.NONE }
                title={ title }
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
                        mayProceed: acceptState.status === AcceptStatus.NONE && (props.requestToAccept.locType === 'Transaction' || limits.areValid()),
                        callback: () => setStatus(AcceptStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                {
                    props.requestToAccept.locType === 'Transaction' &&
                    <>
                    <p>You are about to create the LOC and accept the request</p>
                    <p>The LOC's creation will require your signature and may take several seconds.</p>
                    </>
                }
                {
                    props.requestToAccept.locType === 'Collection' &&
                    <>
                    <CollectionLocMessage/>
                    <CollectionLimitsForm
                        value={ limits }
                        onChange={ value => setLimits(value) }
                        colors={ colorTheme.dialog }
                    />
                    </>
                }
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
                        callback: closeAndRefresh,
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
