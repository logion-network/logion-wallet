import { useState, useEffect, useCallback } from 'react';
import { Fees } from '@logion/node-api';
import { LocData } from '@logion/client';
import { useLogionChain } from '../logion-chain';
import { useCommonContext } from '../common/CommonContext';
import ClientExtrinsicSubmitter, { Call } from '../ClientExtrinsicSubmitter';
import ProcessStep from '../common/ProcessStep';
import CollectionLocMessage from '../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../loc/CollectionLimitsForm';
import { useLocContext } from 'src/loc/LocContext';
import { CallCallback } from '../ClientExtrinsicSubmitter';
import EstimatedFees, { getOtherFeesPaidBy, PAID_BY_REQUESTER } from './fees/EstimatedFees';
import { AcceptedRequest } from "@logion/client/dist/Loc";
import { FeeEstimator } from "./fees/FeeEstimator";

enum OpenStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    OPENED,
}

interface AcceptState {
    status: OpenStatus;
}

export interface Props {
    requestToOpen: LocData | null,
    clearRequestToOpen: () => void,
}

export default function OpenLoc(props: Props) {
    const { signer, client } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { mutateLocState } = useLocContext();
    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: OpenStatus.NONE});
    const [ call, setCall ] = useState<Call>();
    const [ error, setError ] = useState<boolean>(false);
    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);
    const [ fees, setFees ] = useState<Fees | undefined | null>();

    const setStatus = useCallback((status: OpenStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    useEffect(() => {
        if(fees === undefined && props.requestToOpen && client) {
            const request = props.requestToOpen;
            setFees(null);
            const estimator = new FeeEstimator(client);
            (async function() {
                let fees = await estimator.estimateCreateLoc(request, limits);
                setFees(fees);
            })();
        }
    }, [ fees, client, props.requestToOpen, limits ]);

    // LOC creation
    useEffect(() => {
        if(acceptState.status === OpenStatus.LOC_CREATION_PENDING) {
            setStatus(OpenStatus.CREATING_LOC);
            setCall(() => async (callback: CallCallback) =>
                await mutateLocState(async current => {
                    if(client && signer && current instanceof AcceptedRequest) {
                        if(current.data().locType !== "Collection") {
                            return current.open({
                                signer,
                                callback,
                            });
                        } else {
                            const apiLimits = await limits.toApiLimits(client.logionApi)
                            return current.openCollection({
                                ...apiLimits,
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
        limits,
        client,
    ]);

    const resetFields = useCallback(() => {
        setLimits(DEFAULT_LIMITS);
    }, [ setLimits ]);

    const close = useCallback(() => {
        setStatus(OpenStatus.NONE);
        resetFields();
        props.clearRequestToOpen();
    }, [ setStatus, props, resetFields ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refresh(false);
    }, [ refresh, close ]);

    if(props.requestToOpen === null) {
        return null;
    }

    let title;
    if(props.requestToOpen.locType === 'Transaction') {
        title = "Opening Transaction Protection Request";
    } else if(props.requestToOpen.locType === 'Collection') {
        title = "Opening Collection Protection Request";
    } else if(props.requestToOpen.locType === 'Identity') {
        title = "Opening Identity Case Request";
    } else {
        throw new Error(`Unsupported LOC type ${props.requestToOpen.locType}`);
    }

    return (
        <div>
            <ProcessStep
                active={ acceptState.status === OpenStatus.NONE }
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
                        mayProceed: acceptState.status === OpenStatus.NONE && (props.requestToOpen.locType !== 'Collection' || limits.areValid()),
                        callback: () => setStatus(OpenStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                {
                    props.requestToOpen.locType !== 'Collection' &&
                    <>
                        <p>You are about to create the LOC</p>
                        <p>The LOC's creation will require your signature and may take several seconds.</p>
                        <EstimatedFees
                            fees={ fees }
                            centered={ true }
                            inclusionFeePaidBy={ PAID_BY_REQUESTER }
                            otherFeesPaidBy={ getOtherFeesPaidBy(props.requestToOpen) }
                        />
                    </>
                }
                {
                    props.requestToOpen.locType === 'Collection' &&
                    <>
                        <CollectionLocMessage/>
                        <CollectionLimitsForm
                            value={ limits }
                            onChange={ value => setLimits(value) }
                            colors={ colorTheme.dialog }
                        />
                        <EstimatedFees
                            fees={ fees }
                            centered={ true }
                            inclusionFeePaidBy={ PAID_BY_REQUESTER }
                            otherFeesPaidBy={ getOtherFeesPaidBy(props.requestToOpen) }
                        />
                    </>
                }
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === OpenStatus.CREATING_LOC
                    || acceptState.status === OpenStatus.OPENED }
                title="Creating LOC"
                nextSteps={[
                    {
                        id: 'close',
                        buttonText: 'Close',
                        buttonVariant: 'primary',
                        mayProceed: acceptState.status === OpenStatus.OPENED || error,
                        callback: closeAndRefresh,
                    }
                ]}
            >
                <ClientExtrinsicSubmitter
                    call={ call }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setStatus(OpenStatus.OPENED) }
                    onError={ () => setError(true) }
                />
            </ProcessStep>
        </div>
    );
}
