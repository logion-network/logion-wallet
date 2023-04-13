import { useState, useEffect, useCallback } from 'react';
import { LocRequest } from '@logion/client';
import { UUID, createLogionIdentityLoc, createLogionTransactionLoc, createPolkadotIdentityLoc, createPolkadotTransactionLoc } from '@logion/node-api';

import { useLogionChain } from '../logion-chain';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import ProcessStep from '../legal-officer/ProcessStep';
import { useLegalOfficerContext } from '../legal-officer/LegalOfficerContext';
import Alert from '../common/Alert';
import { signAndSend } from '../logion-chain/Signature';
import { acceptLocRequest } from "./Model";

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
    exit: () => void,
    onSuccess: () => void,
}

export default function LocCreationSteps(props: Props) {
    const { api, accounts } = useLogionChain();
    const { axios } = useLegalOfficerContext();

    const [ creationState, setCreationState ] = useState<CreationState>({ status: CreationStatus.LOC_CREATION_PENDING });

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const setStatus = useCallback((status: CreationStatus) => {
        setCreationState({ ...creationState, status });
    }, [ creationState, setCreationState ]);

    const { exit, onSuccess, requestToCreate } = props;

    // LOC creation
    useEffect(() => {
        if (creationState.status === CreationStatus.LOC_CREATION_PENDING) {
            setStatus(CreationStatus.CREATING_LOC);
            const proceed = async () => {
                let signAndSubmit: SignAndSubmit;
                if(requestToCreate!.requesterAddress && requestToCreate!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.accountId.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createPolkadotTransactionLoc({
                            api: api!,
                            locId: new UUID(requestToCreate!.id),
                            requester: requestToCreate!.requesterAddress!,
                        })
                    });
                } else if(requestToCreate!.requesterAddress && requestToCreate!.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.accountId.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createPolkadotIdentityLoc({
                            api: api!,
                            locId: new UUID(requestToCreate!.id),
                            requester: requestToCreate!.requesterAddress!,
                        })
                    });
                } else if(requestToCreate!.requesterIdentityLoc && requestToCreate!.locType === 'Transaction') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.accountId.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createLogionTransactionLoc({
                            api: api!,
                            locId: new UUID(requestToCreate!.id),
                            requesterLocId: UUID.fromAnyString(requestToCreate!.requesterIdentityLoc!)!,
                        })
                    });
                } else if(!requestToCreate!.requesterAddress && !requestToCreate!.requesterIdentityLoc && requestToCreate!.locType === 'Identity') {
                    signAndSubmit = (setResult, setError) => signAndSend({
                        signerId: accounts!.current!.accountId.address,
                        callback: setResult,
                        errorCallback: setError,
                        submittable: createLogionIdentityLoc({
                            api: api!,
                            locId: new UUID(requestToCreate!.id),
                        })
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

    const accept = useCallback(async () => {
        await acceptLocRequest(axios!, { requestId: requestToCreate!.id })
        setStatus(CreationStatus.LOC_CREATED);
    }, [ axios, requestToCreate, setStatus ])

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
                    onSuccess={ accept }
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
