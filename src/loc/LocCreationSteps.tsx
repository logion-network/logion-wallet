import { useState, useEffect, useCallback } from 'react';
import { LocRequest, PendingRequest } from '@logion/client';
import { UUID } from "@logion/node-api";

import { useLogionChain } from '../logion-chain';
import ClientExtrinsicSubmitter, { Call, CallCallback } from '../ClientExtrinsicSubmitter';
import ProcessStep from '../legal-officer/ProcessStep';
import Alert from '../common/Alert';
import { useLocContext } from './LocContext';
import { useLegalOfficerContext } from 'src/legal-officer/LegalOfficerContext';
import { fetchAllLocsParams } from './LegalOfficerLocContext';

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
    const { signer, client } = useLogionChain();
    const { mutateLocState } = useLocContext();
    const [ creationState, setCreationState ] = useState<CreationState>({ status: CreationStatus.LOC_CREATION_PENDING });
    const [ call, setCall ] = useState<Call>();
    const { refreshLocs, legalOfficer } = useLegalOfficerContext();

    const setStatus = useCallback((status: CreationStatus) => {
        setCreationState({ ...creationState, status });
    }, [ creationState, setCreationState ]);

    const { exit, onSuccess, requestToCreate: locToCreate } = props;

    // LOC creation
    useEffect(() => {
        if (legalOfficer && locToCreate && client && creationState.status === CreationStatus.LOC_CREATION_PENDING) {
            setStatus(CreationStatus.CREATING_LOC);
            (async function() {
                const locs = await client.locsState(fetchAllLocsParams(legalOfficer));
                const pending = locs.findById(new UUID(locToCreate.id)) as PendingRequest;
                const call = async (callback: CallCallback) =>
                    mutateLocState(async current => {
                        if(signer) {
                            const loc = await pending.legalOfficer.accept({
                                signer,
                                callback,
                            });
                            const locs = loc.locsState();
                            refreshLocs(locs);
                            return locs;
                        } else {
                            return current;
                        }
                    });
                setCall(() => call);
            })();
        }
    }, [
        creationState,
        setStatus,
        mutateLocState,
        signer,
    ]);

    const clear = useCallback(() => {
        setStatus(CreationStatus.NONE);
        setCall(undefined);
        exit();
    }, [ setStatus, setCall, exit ]);

    const close = useCallback(() => {
        const success = creationState.status === CreationStatus.LOC_CREATED;
        clear();
        if(success) {
            onSuccess();
        }
    }, [ creationState, clear, onSuccess ])

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
