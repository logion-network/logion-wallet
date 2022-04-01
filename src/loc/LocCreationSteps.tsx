import { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../logion-chain';
import { UUID } from '../logion-chain/UUID';
import { createLogionIdentityLoc, createLogionTransactionLoc, createPolkadotIdentityLoc, createPolkadotTransactionLoc, createCollectionLoc } from '../logion-chain/LogionLoc';
import { useCommonContext } from '../common/CommonContext';
import { LocRequest } from '../common/types/ModelTypes';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import ProcessStep from '../legal-officer/ProcessStep';
import { useLegalOfficerContext } from '../legal-officer/LegalOfficerContext';
import Alert from '../common/Alert';
import { LegalOfficerCase } from '../logion-chain/Types';

enum CreationStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    LOC_CREATED,
    LOC_CREATION_FAILED,
    DONE
}

interface CreationState {
    status: CreationStatus;
}

export interface Props {
    requestToCreate: LocRequest | null,
    replacedLoc?: LegalOfficerCase | null,
    exit: () => void,
    onSuccess: () => void,
}

export default function LocCreationSteps(props: Props) {
    const { api } = useLogionChain();
    const { accounts } = useCommonContext();
    const { axios } = useLegalOfficerContext();

    const [ creationState, setCreationState ] = useState<CreationState>({ status: CreationStatus.LOC_CREATION_PENDING });

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const setStatus = useCallback((status: CreationStatus) => {
        setCreationState({ ...creationState, status });
    }, [ creationState, setCreationState ]);

    const { exit, onSuccess, requestToCreate, replacedLoc } = props;

    // LOC creation
    useEffect(() => {
        if (creationState.status === CreationStatus.LOC_CREATION_PENDING) {
            setStatus(CreationStatus.CREATING_LOC);
            const proceed = async () => {
                let signAndSubmit: SignAndSubmit;
                if(requestToCreate!.requesterAddress && requestToCreate!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => createPolkadotTransactionLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(requestToCreate!.id),
                        requester: requestToCreate!.requesterAddress!,
                    });
                } else if(requestToCreate!.requesterAddress && requestToCreate!.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => createPolkadotIdentityLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(requestToCreate!.id),
                        requester: requestToCreate!.requesterAddress!,
                    });
                } else if(requestToCreate!.requesterIdentityLoc && requestToCreate!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => createLogionTransactionLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(requestToCreate!.id),
                        requesterLocId: UUID.fromAnyString(requestToCreate!.requesterIdentityLoc!)!,
                    });
                } else if(!requestToCreate!.requesterAddress && !requestToCreate!.requesterIdentityLoc && requestToCreate!.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => createLogionIdentityLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(requestToCreate!.id),
                    });
                } else if(requestToCreate!.requesterAddress && requestToCreate!.locType === 'Collection') {
                    signAndSubmit = (setResult, setError) => createCollectionLoc({
                        api: api!,
                        signerId: accounts!.current!.address,
                        callback: setResult,
                        errorCallback: setError,
                        locId: new UUID(requestToCreate!.id),
                        requester: requestToCreate!.requesterAddress!,
                        lastBlock: replacedLoc!.collectionLastBlockSubmission ? replacedLoc!.collectionLastBlockSubmission.toString() : undefined,
                        maxSize: replacedLoc!.collectionMaxSize ? replacedLoc!.collectionMaxSize.toString() : undefined,
                    });
                } else {
                    throw new Error("Unexpected LOC request state");
                }
                setSignAndSubmit(() => signAndSubmit);
            };
            proceed();
        }
    }, [
        axios,
        creationState,
        setStatus,
        setCreationState,
        api,
        requestToCreate,
        accounts,
        replacedLoc,
    ]);

    const clear = useCallback(() => {
        setStatus(CreationStatus.NONE);
        setSignAndSubmit(null);
        exit();
    }, [ setStatus, setSignAndSubmit, exit ]);

    const close = useCallback(() => {
        const success = creationState.status === CreationStatus.LOC_CREATED;
        clear();
        if(success) {
            onSuccess();
        }
    }, [ creationState, clear, onSuccess ])

    if (requestToCreate === null) {
        return null;
    }

    return (
        <div>
            <ProcessStep
                active={ creationState.status === CreationStatus.CREATING_LOC }
                title={ `LOC creation` }
                nextSteps={[]}
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="metadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(CreationStatus.LOC_CREATED) }
                    onError={ () => setStatus(CreationStatus.LOC_CREATION_FAILED) }
                />
            </ProcessStep>
            <ProcessStep
                active={ creationState.status === CreationStatus.LOC_CREATED || creationState.status === CreationStatus.LOC_CREATION_FAILED }
                title={ `LOC creation` }
                nextSteps={[
                    {
                        id: "ok",
                        buttonText: "OK",
                        buttonVariant: "primary",
                        mayProceed: true,
                        callback: close
                    }
                ]}
            >
                {
                    creationState.status === CreationStatus.LOC_CREATED &&
                    <Alert variant='polkadot'>
                        LOC successfully created.
                    </Alert>
                }
                {
                    creationState.status === CreationStatus.LOC_CREATION_FAILED &&
                    <Alert variant='danger'>
                        LOC creation failed.
                    </Alert>
                }
            </ProcessStep>
        </div>
    );
}
