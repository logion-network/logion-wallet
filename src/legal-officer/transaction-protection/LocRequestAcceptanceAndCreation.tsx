import { useState, useEffect, useCallback } from 'react';
import { Fees } from '@logion/node-api';
import { LocData, PendingRequest, AcceptedRequest } from '@logion/client';
import { useLogionChain } from '../../logion-chain';
import { useCommonContext } from '../../common/CommonContext';
import ClientExtrinsicSubmitter, { Call } from '../../ClientExtrinsicSubmitter';
import ProcessStep from '../../common/ProcessStep';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useLocContext } from 'src/loc/LocContext';
import { CallCallback } from '../../ClientExtrinsicSubmitter';
import EstimatedFees, { PAID_BY_LEGAL_OFFICER, getOtherFeesPaidBy } from '../../loc/fees/EstimatedFees';

enum AcceptStatus {
    NONE,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    ACCEPTED,
}

interface AcceptState {
    status: AcceptStatus;
}

export interface Props {
    requestToAccept: LocData | null,
    clearRequestToAccept: () => void,
}

export default function LocRequestAcceptanceAndCreation(props: Props) {
    const { signer } = useLogionChain();
    const { refresh } = useCommonContext();
    const { refreshLocs } = useLegalOfficerContext();
    const { mutateLocState, locState } = useLocContext();
    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});
    const [ call, setCall ] = useState<Call>();
    const [ error, setError ] = useState<boolean>(false);
    const [ fees, setFees ] = useState<Fees | undefined | null>();

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    useEffect(() => {
        if(fees === undefined && props.requestToAccept && locState instanceof PendingRequest) {
            setFees(null);
            (async function() {
                const fees = await locState.legalOfficer.estimateFeesAccept();
                if (fees) {
                    setFees(fees);
                }
            })();
        }
    }, [ fees, props.requestToAccept, locState ]);

    const close = useCallback(() => {
        setStatus(AcceptStatus.NONE);
        props.clearRequestToAccept();
    }, [ setStatus, props ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refresh(false);
        refreshLocs();
    }, [ refresh, close, refreshLocs ]);

    // LOC Acceptance
    useEffect(() => {
        if(acceptState.status === AcceptStatus.LOC_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_LOC);
            setCall(() => async (callback: CallCallback) =>
                await mutateLocState(async current => {
                    if(signer && current instanceof PendingRequest) {
                        const accepted = await current.legalOfficer.accept({
                            signer,
                            callback,
                        });
                        if (accepted instanceof AcceptedRequest) {
                            closeAndRefresh();
                        }
                        return accepted;
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
        closeAndRefresh,
    ]);

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
                        mayProceed: acceptState.status === AcceptStatus.NONE,
                        callback: () => setStatus(AcceptStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                <p>You are about to accept the LOC request and open the LOC</p>
                <EstimatedFees
                    fees={ fees }
                    centered={ true }
                    inclusionFeePaidBy={ PAID_BY_LEGAL_OFFICER }
                    otherFeesPaidBy={ getOtherFeesPaidBy(props.requestToAccept) }
                />
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
                        callback: () => closeAndRefresh(),
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
