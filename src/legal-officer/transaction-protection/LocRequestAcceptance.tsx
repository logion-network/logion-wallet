import { useState, useEffect, useCallback } from 'react';
import { ChainTime } from '@logion/node-api';
import { LocData, PendingRequest } from '@logion/client';

import { useLogionChain } from '../../logion-chain';
import { useCommonContext } from '../../common/CommonContext';
import ClientExtrinsicSubmitter, { Call } from '../../ClientExtrinsicSubmitter';

import ProcessStep from '../ProcessStep';

import CollectionLocMessage from '../../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../../loc/CollectionLimitsForm';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useLocContext } from 'src/loc/LocContext';
import { CallCallback } from '../../ClientExtrinsicSubmitter';

enum AcceptStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
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
    const { api, signer } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { refreshLocs } = useLegalOfficerContext();
    const { mutateLocState } = useLocContext();

    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});

    const [ call, setCall ] = useState<Call>();
    const [ error, setError ] = useState<boolean>(false);

    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    // LOC creation
    useEffect(() => {
        if(acceptState.status === AcceptStatus.LOC_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_LOC);
            setCall(() => async (callback: CallCallback) =>
                await mutateLocState(async current => {
                    if(signer && current instanceof PendingRequest) {
                        if(current.data().locType !== "Collection") {
                            return current.legalOfficer.accept({
                                signer,
                                callback,
                            });
                        } else {
                            let lastBlock: bigint | undefined;
                            if(limits.hasDateLimit) {
                                const now = await ChainTime.now(api!.polkadot);
                                const atDateLimit = await now.atDate(limits.dateLimit!);
                                lastBlock = atDateLimit.currentBlock;
                            }

                            let maxSize: number | undefined;
                            if(limits.hasDataNumberLimit) {
                                maxSize = Number(limits.dataNumberLimit);
                            }

                            return current.legalOfficer.acceptCollection({
                                collectionCanUpload: limits.canUpload,
                                collectionLastBlockSubmission: lastBlock,
                                collectionMaxSize: maxSize,
                                signer,
                                callback,
                            });
                        }
                    } else {
                        return current;
                    }
                })
            );
        }
    }, [
        acceptState,
        mutateLocState,
        signer,
        setStatus,
        api,
        limits,
    ]);

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
                <ClientExtrinsicSubmitter
                    call={ call }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(AcceptStatus.ACCEPTED) }
                    onError={ () => setError(true) }
                />
            </ProcessStep>
        </div>
    );
}
