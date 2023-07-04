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
import Button from 'src/common/Button';
import PolkadotFrame from 'src/common/PolkadotFrame';
import "./OpenLoc.css";

enum OpenStatus {
    NONE,
    CREATE_LOC,
    LOC_CREATION_PENDING,
    CREATING_LOC,
    OPENED,
}

export interface Props {
    loc: LocData;
}

export default function OpenLoc(props: Props) {
    const { signer, client } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { mutateLocState } = useLocContext();
    const [ acceptState, setAcceptState ] = useState<OpenStatus>(OpenStatus.NONE);
    const [ call, setCall ] = useState<Call>();
    const [ error, setError ] = useState<boolean>(false);
    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);
    const [ fees, setFees ] = useState<Fees | undefined | null>();

    useEffect(() => {
        if(fees === undefined && client) {
            const request = props.loc;
            setFees(null);
            const estimator = new FeeEstimator(client);
            (async function() {
                let fees = await estimator.estimateCreateLoc(request, limits);
                setFees(fees);
            })();
        }
    }, [ fees, client, props.loc, limits ]);

    // LOC creation
    useEffect(() => {
        if(acceptState === OpenStatus.LOC_CREATION_PENDING) {
            setAcceptState(OpenStatus.CREATING_LOC);
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
        limits,
        client,
    ]);

    const resetFields = useCallback(() => {
        setLimits(DEFAULT_LIMITS);
    }, [ setLimits ]);

    const close = useCallback(() => {
        setAcceptState(OpenStatus.NONE);
        resetFields();
    }, [ resetFields ]);

    const closeAndRefresh = useCallback(() => {
        close();
        refresh(false);
    }, [ refresh, close ]);

    let title;
    if(props.loc.locType === 'Transaction') {
        title = "Transaction Legal Officer Case (LOC) creation";
    } else if(props.loc.locType === 'Collection') {
        title = "Collection Legal Officier Case (LOC) creation";
    } else if(props.loc.locType === 'Identity') {
        title = "Identity Legal Officier Case (LOC) creation";
    } else {
        throw new Error(`Unsupported LOC type ${props.loc.locType}`);
    }

    return (
        <PolkadotFrame
            className="OpenLoc"
        >
            <div className="content">
                <div className="text-container">
                    Do you want to create this LOC?
                </div>
                <div className="button-container">
                    <Button
                        onClick={ () => setAcceptState(OpenStatus.CREATE_LOC) }
                        data-testid={ `accept-${ props.loc.id }` }
                        variant="polkadot"
                    >
                        Create LOC
                    </Button>
                </div>
            </div>
            <ProcessStep
                active={ acceptState === OpenStatus.CREATE_LOC }
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
                        mayProceed: acceptState === OpenStatus.CREATE_LOC && (props.loc.locType !== 'Collection' || limits.areValid()),
                        callback: () => setAcceptState(OpenStatus.LOC_CREATION_PENDING),
                    }
                ]}
            >
                {
                    props.loc.locType !== 'Collection' &&
                    <>
                        <p>You are about to create the LOC on the Logion blockchain.</p>
                        <p>The LOC's creation will require your signature and may take several seconds.</p>
                        <EstimatedFees
                            fees={ fees }
                            centered={ true }
                            inclusionFeePaidBy={ PAID_BY_REQUESTER }
                            otherFeesPaidBy={ getOtherFeesPaidBy(props.loc) }
                        />
                    </>
                }
                {
                    props.loc.locType === 'Collection' &&
                    <>
                        <CollectionLocMessage/>
                        <p>The LOC's creation will require your signature and may take several seconds.</p>
                        <CollectionLimitsForm
                            value={ limits }
                            onChange={ value => setLimits(value) }
                            colors={ colorTheme.dialog }
                        />
                        <EstimatedFees
                            fees={ fees }
                            centered={ true }
                            inclusionFeePaidBy={ PAID_BY_REQUESTER }
                            otherFeesPaidBy={ getOtherFeesPaidBy(props.loc) }
                        />
                    </>
                }
            </ProcessStep>
            <ProcessStep
                active={ acceptState === OpenStatus.CREATING_LOC
                    || acceptState === OpenStatus.OPENED }
                title="Creating LOC"
                nextSteps={[
                    {
                        id: 'close',
                        buttonText: 'Close',
                        buttonVariant: 'primary',
                        mayProceed: acceptState === OpenStatus.OPENED || error,
                        callback: closeAndRefresh,
                    }
                ]}
            >
                <ClientExtrinsicSubmitter
                    call={ call }
                    successMessage="LOC successfully created."
                    onSuccess={ () => setAcceptState(OpenStatus.OPENED) }
                    onError={ () => setError(true) }
                />
            </ProcessStep>
        </PolkadotFrame>
    );
}