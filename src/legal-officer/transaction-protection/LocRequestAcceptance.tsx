import { useState, useEffect, useCallback } from 'react';
import {
    createCollectionLoc,
    createPolkadotTransactionLoc,
    createPolkadotIdentityLoc,
    createLogionTransactionLoc,
    createLogionIdentityLoc,
    ChainTime
} from '@logion/node-api';
import { LocData } from '@logion/client';

import { useLogionChain } from '../../logion-chain';
import { useCommonContext } from '../../common/CommonContext';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { acceptLocRequest } from '../../loc/Model';
import ProcessStep from '../ProcessStep';

import CollectionLocMessage from '../../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../../loc/CollectionLimitsForm';
import { signAndSend } from '../../logion-chain/Signature';
import { useLegalOfficerContext } from "../LegalOfficerContext";

enum AcceptStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    ACCEPTANCE_PENDING,
    ACCEPTING,
    ACCEPTED,
    DONE
}

interface AcceptState {
    status: AcceptStatus;
}

export interface Props {
    requestToAccept: LocData | null,
    clearRequestToAccept: () => void,
}

export default function LocRequestAcceptance(props: Props) {
    const { accounts, axiosFactory, api } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { refreshLocs } = useLegalOfficerContext()

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
                if(props.requestToAccept!.requesterAddress && props.requestToAccept!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createPolkadotTransactionLoc({
                            api: api!,
                            locId: props.requestToAccept!.id,
                            requester: props.requestToAccept!.requesterAddress!,
                        })
                    });
                } else if(props.requestToAccept!.requesterLocId && props.requestToAccept!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createLogionTransactionLoc({
                            api: api!,
                            locId: props.requestToAccept!.id,
                            requesterLocId: props.requestToAccept!.requesterLocId!,
                        })
                    });
                } else if(props.requestToAccept?.locType === 'Collection') {
                    let lastBlock: string | undefined;
                    if(limits.hasDateLimit) {
                        const now = await ChainTime.now(api!);
                        const atDateLimit = await now.atDate(limits.dateLimit!);
                        lastBlock = atDateLimit.currentBlock.toString();
                    }

                    let maxSize: string | undefined;
                    if(limits.hasDataNumberLimit) {
                        maxSize = limits.dataNumberLimit;
                    }
                    const canUpload = limits.canUpload;
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createCollectionLoc({
                            api: api!,
                            locId: props.requestToAccept!.id,
                            requester: props.requestToAccept!.requesterAddress!,
                            lastBlock,
                            maxSize,
                            canUpload,
                        })
                    });
                } else if(props.requestToAccept!.requesterAddress && props.requestToAccept?.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createPolkadotIdentityLoc({
                            api: api!,
                            locId: props.requestToAccept!.id,
                            requester: props.requestToAccept!.requesterAddress!,
                        })
                    });
                } else if(!props.requestToAccept!.requesterAddress && props.requestToAccept?.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createLogionIdentityLoc({
                            api: api!,
                            locId: props.requestToAccept!.id,
                        })
                    });
                } else {
                    setError(true);
                    throw new Error(`Unsupported LOC type ${props.requestToAccept?.locType} / ${props.requestToAccept?.requesterAddress} / ${props.requestToAccept?.requesterLocId}`);
                }

                setSignAndSubmit(() => signAndSubmit);
            })();
        }
    }, [
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
                await acceptLocRequest(axiosFactory!(props.requestToAccept!.ownerAddress)!, { requestId: props.requestToAccept!.id.toString() });
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
        refresh(false);
        refreshLocs();
    }, [ refresh, close, refreshLocs ]);

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
                        id: 'proceed',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: acceptState.status === AcceptStatus.NONE && (props.requestToAccept.locType !== 'Collection' || limits.areValid()),
                        callback: () => setStatus(AcceptStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                {
                    props.requestToAccept.locType !== 'Collection' &&
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
