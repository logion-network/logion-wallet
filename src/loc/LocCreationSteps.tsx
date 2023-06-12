import { useState, useEffect, useCallback } from 'react';
import { OpenLocParams } from '@logion/client';
import { UUID } from "@logion/node-api";
import { useLogionChain } from '../logion-chain';
import ClientExtrinsicSubmitter, { Call, CallCallback } from '../ClientExtrinsicSubmitter';
import ProcessStep from '../common/ProcessStep';
import Alert from '../common/Alert';
import { useLegalOfficerContext } from 'src/legal-officer/LegalOfficerContext';

enum CreationStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    LOC_CREATED,
    LOC_CREATION_FAILED,
}

interface CreationState {
    status: CreationStatus;
}

export interface Props {
    requestToCreate: OpenLocParams | null,
    exit: () => void,
    onSuccess: (id: UUID) => void,
}

export default function LocCreationSteps(props: Props) {
    const { signer, client } = useLogionChain();
    const [ creationState, setCreationState ] = useState<CreationState>({ status: CreationStatus.LOC_CREATION_PENDING });
    const [ call, setCall ] = useState<Call>();
    const { refreshLocs, legalOfficer, mutateLocsState } = useLegalOfficerContext();
    const [ locId, setLocId ] = useState<UUID>();

    const setStatus = useCallback((status: CreationStatus) => {
        setCreationState({ ...creationState, status });
    }, [ creationState, setCreationState ]);

    const { exit, onSuccess, requestToCreate: locToCreate } = props;

    // LOC creation
    useEffect(() => {
        if (legalOfficer && locToCreate && client && creationState.status === CreationStatus.LOC_CREATION_PENDING) {
            setStatus(CreationStatus.CREATING_LOC);
            setCall(() => async (callback: CallCallback) => {
                await mutateLocsState(async current => {
                    if (signer) {
                        const loc = await current.legalOfficer.createLoc({
                            ...locToCreate,
                            locType: locToCreate.locType,
                            signer,
                            callback,
                        });
                        setLocId(loc.locId);
                        return loc.locsState();
                    } else {
                        return current;
                    }
                })});
        }
    }, [
        client,
        legalOfficer,
        locToCreate,
        refreshLocs,
        creationState,
        setStatus,
        mutateLocsState,
        signer,
        setCall,
    ]);

    const clear = useCallback(() => {
        setStatus(CreationStatus.NONE);
        setCall(undefined);
        exit();
    }, [ setStatus, setCall, exit ]);

    const close = useCallback(() => {
        const success = creationState.status === CreationStatus.LOC_CREATED;
        clear();
        if(success && locId) {
            onSuccess(locId);
        }
    }, [ creationState, clear, onSuccess, locId ])

    if (locToCreate === null) {
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
                <ClientExtrinsicSubmitter
                    call={ call }
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
