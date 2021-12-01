import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';

import { useLogionChain } from '../../logion-chain';
import { UUID } from '../../logion-chain/UUID';
import { createLoc } from '../../logion-chain/LogionLoc';
import { useCommonContext } from '../../common/CommonContext';
import { LocRequest } from '../../common/types/ModelTypes';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';
import ProcessStep from '../ProcessStep';
import { useLegalOfficerContext } from '../LegalOfficerContext';
import { LocType } from '../../logion-chain/Types';

enum CreationStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    LOC_CREATED,
    DONE
}

interface CreationState {
    status: CreationStatus;
}

export interface Props {
    requestToCreate: LocRequest | null,
    locType: LocType,
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

    const { exit, onSuccess, requestToCreate } = props;

    // LOC creation
    useEffect(() => {
        if (creationState.status === CreationStatus.LOC_CREATION_PENDING) {
            setStatus(CreationStatus.CREATING_LOC);
            const proceed = async () => {
                const signAndSubmit: SignAndSubmit = (setResult, setError) => createLoc({
                    api: api!,
                    signerId: accounts!.current!.address,
                    callback: setResult,
                    errorCallback: setError,
                    locId: new UUID(requestToCreate!.id),
                    requester: requestToCreate!.requesterAddress,
                    locType: props.locType,
                });
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
        props.locType,
    ]);

    const cancel = useCallback(() => {
        setStatus(CreationStatus.NONE);
        exit();
    }, [ setStatus, exit ]);

    const close = useCallback(() => {
        setStatus(CreationStatus.NONE);
        exit();
        onSuccess();
    }, [ setStatus, exit, onSuccess ])

    if (requestToCreate === null) {
        return null;
    }

    return (
        <div>
            <ProcessStep
                active={ creationState.status === CreationStatus.NONE }
                closeCallback={ cancel }
                title={ `LOC creation` }
                mayProceed={ true }
                proceedCallback={ () => setStatus(CreationStatus.LOC_CREATION_PENDING) }
                stepTestId={ `modal-accepted-${ requestToCreate.id }` }
                proceedButtonTestId={ `proceed-create-${ requestToCreate.id }` }
            >
                <Alert variant="success">
                    <p>You may now proceed with creating the LOC.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ creationState.status === CreationStatus.CREATING_LOC || creationState.status === CreationStatus.LOC_CREATED }
                title={ `LOC creation` }
                mayProceed={ creationState.status === CreationStatus.LOC_CREATED }
                proceedCallback={ () => setStatus(CreationStatus.DONE) }
                stepTestId={ `modal-creating-${ requestToCreate.id }` }
                proceedButtonTestId={ `proceed-review-${ requestToCreate.id }` }
            >
                <ExtrinsicSubmitter
                    id="metadata"
                    signAndSubmit={ signAndSubmit }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(CreationStatus.LOC_CREATED) }
                    onError={ () => {
                    } }
                />
            </ProcessStep>
            <ProcessStep
                active={ creationState.status === CreationStatus.DONE }
                closeCallback={ close }
                title={ `LOC created` }
                stepTestId={ `modal-review-${ requestToCreate.id }` }
                closeButtonTestId={ `close-review-${ requestToCreate.id }` }
            >
                <div>
                    <p>LOC was successfully created for request { requestToCreate.id }.</p>
                </div>
            </ProcessStep>
        </div>
    );
}
