import { useState, useEffect, useCallback } from 'react';
import { ChainTime, Fees, LogionNodeApiClass } from '@logion/node-api';
import { LocData, PendingRequest } from '@logion/client';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';

import { useLogionChain } from '../../logion-chain';
import { useCommonContext } from '../../common/CommonContext';
import ClientExtrinsicSubmitter, { Call } from '../../ClientExtrinsicSubmitter';

import ProcessStep from '../ProcessStep';

import CollectionLocMessage from '../../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../../loc/CollectionLimitsForm';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useLocContext } from 'src/loc/LocContext';
import { CallCallback } from '../../ClientExtrinsicSubmitter';
import EstimatedFees, { PAID_BY_LEGAL_OFFICER, getOtherFeesPaidBy } from 'src/loc/EstimatedFees';

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
    const { signer, client } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { refreshLocs } = useLegalOfficerContext();
    const { mutateLocState } = useLocContext();
    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});
    const [ call, setCall ] = useState<Call>();
    const [ error, setError ] = useState<boolean>(false);
    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);
    const [ fees, setFees ] = useState<Fees | undefined | null>();

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    useEffect(() => {
        if(fees === undefined && props.requestToAccept && client) {
            const request = props.requestToAccept;
            const locId = client.logionApi.adapters.toLocId(request.id);
            const requesterAddress = request.requesterAddress?.address || "";
            setFees(null);
            (async function() {
                let submittable: SubmittableExtrinsic;
                if(request.locType === "Collection") {
                    const apiLimits = await toApiLimits(client.logionApi, limits);
                    submittable = client.logionApi.polkadot.tx.logionLoc.createCollectionLoc(
                        locId,
                        requesterAddress,
                        apiLimits.collectionLastBlockSubmission || null,
                        apiLimits.collectionMaxSize || null,
                        apiLimits.collectionCanUpload,
                    );
                } else if(request.locType === "Identity") {
                    if(request.requesterAddress) {
                        submittable = client.logionApi.polkadot.tx.logionLoc.createPolkadotIdentityLoc(
                            locId,
                            requesterAddress,
                        );
                    } else {
                        submittable = client.logionApi.polkadot.tx.logionLoc.createLogionIdentityLoc(
                            locId,
                        );
                    }
                } else if(request.locType === "Transaction") {
                    if(request.requesterAddress) {
                        submittable = client.logionApi.polkadot.tx.logionLoc.createPolkadotTransactionLoc(
                            locId,
                            requesterAddress,
                        );
                    } else if(request.requesterLocId) {
                        submittable = client.logionApi.polkadot.tx.logionLoc.createLogionTransactionLoc(
                            locId,
                            client.logionApi.adapters.toNonCompactLocId(request.requesterLocId),
                        );
                    } else {
                        throw new Error("Transaction LOC without requester");
                    }
                } else {
                    throw new Error("Unsupported LOC type");
                }

                let fees = await client.logionApi.fees.estimateCreateLoc({
                    origin: client.currentAddress?.address || "",
                    locType: request.locType,
                    submittable,
                });
                setFees(fees);
            })();
        }
    }, [ fees, client, props.requestToAccept, limits ]);

    // LOC creation
    useEffect(() => {
        if(acceptState.status === AcceptStatus.LOC_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_LOC);
            setCall(() => async (callback: CallCallback) =>
                await mutateLocState(async current => {
                    if(client && signer && current instanceof PendingRequest) {
                        if(current.data().locType !== "Collection") {
                            return current.legalOfficer.accept({
                                signer,
                                callback,
                            });
                        } else {
                            const apiLimits = await toApiLimits(client.logionApi, limits);
                            return current.legalOfficer.acceptCollection({
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
                    <EstimatedFees
                        fees={ fees }
                        centered={ true }
                        inclusionFeePaidBy={ PAID_BY_LEGAL_OFFICER }
                        otherFeesPaidBy={ getOtherFeesPaidBy(props.requestToAccept) }
                    />
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

async function toApiLimits(api: LogionNodeApiClass, limits: CollectionLimits) {
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

    return {
        collectionCanUpload: limits.canUpload,
        collectionLastBlockSubmission: lastBlock,
        collectionMaxSize: maxSize,
    }
}
