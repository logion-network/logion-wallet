import { useState, useEffect, useCallback, useMemo } from 'react';
import { Fees } from '@logion/node-api';
import { LocData } from '@logion/client';
import { CallCallback, useLogionChain } from '../logion-chain';
import { useCommonContext } from '../common/CommonContext';
import ProcessStep from '../common/ProcessStep';
import CollectionLocMessage from '../loc/CollectionLocMessage';
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from '../loc/CollectionLimitsForm';
import { useLocContext } from 'src/loc/LocContext';
import EstimatedFees, { getOtherFeesPaidBy, PAID_BY_REQUESTER } from './fees/EstimatedFees';
import { AcceptedRequest } from "@logion/client/dist/Loc";
import Button from 'src/common/Button';
import PolkadotFrame from 'src/common/PolkadotFrame';
import "./OpenLoc.css";
import Checkbox from 'src/components/toggle/Checkbox';
import ExtrinsicSubmissionStateView from 'src/ExtrinsicSubmissionStateView';

enum OpenStatus {
    NONE,
    CREATE_LOC,
    CREATING_LOC,
    CREATED_OR_ERROR,
}

export interface Props {
    loc: LocData;
}

export default function OpenLoc(props: Props) {
    const { signer, client, submitCall } = useLogionChain();
    const { refresh, colorTheme } = useCommonContext();
    const { mutateLocState, locState } = useLocContext();
    const [ acceptState, setAcceptState ] = useState<OpenStatus>(OpenStatus.NONE);
    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);
    const [ fees, setFees ] = useState<Fees | undefined | null>();
    const [ autoPublish, setAutoPublish ] = useState(false);

    useEffect(() => {
        if (fees === undefined && client) {
            setFees(null);
            (async function () {
                if (locState instanceof AcceptedRequest) {
                    setFees(await locState.estimateFeesOpen({ autoPublish }));
                }
            })();
        }
    }, [ fees, client, props.loc, limits, locState, autoPublish ]);

    const openLoc = useMemo(() => {
        return async (callback: CallCallback) =>
            await mutateLocState(async current => {
                if(client && signer && current instanceof AcceptedRequest) {
                    return current.open({
                        signer,
                        callback,
                        autoPublish
                    });
                } else {
                    return current;
                }
            });
    }, [
        mutateLocState,
        client,
        signer,
        autoPublish,
    ]);

    // LOC creation
    const openLocCallback = useCallback(async () => {
        setAcceptState(OpenStatus.CREATING_LOC);
        try {
            await submitCall(openLoc);
        } finally {
            setAcceptState(OpenStatus.CREATED_OR_ERROR);
        }
    }, [
        submitCall,
        openLoc,
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

    const canAutoPublish = useMemo(() => {
        return locState?.data().metadata.find(item => item.status === "REVIEW_ACCEPTED") !== undefined
            || locState?.data().files.find(item => item.status === "REVIEW_ACCEPTED") !== undefined
            || locState?.data().links.find(item => item.status === "REVIEW_ACCEPTED") !== undefined;
    }, [ locState ]);

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
                <div className="toggle-button-container">
                    <div className="toggle-container">
                        <p>Publish accepted?</p>
                        <Checkbox
                            skin="Toggle white"
                            checked={ autoPublish }
                            setChecked={ (value) => {
                                setAutoPublish(value);
                                setFees(undefined);
                            }}
                            disabled={ !canAutoPublish }
                        />
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
                        callback: openLocCallback,
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
                    || acceptState === OpenStatus.CREATED_OR_ERROR }
                title="Creating LOC"
                nextSteps={[
                    {
                        id: 'close',
                        buttonText: 'Close',
                        buttonVariant: 'primary',
                        mayProceed: acceptState === OpenStatus.CREATED_OR_ERROR,
                        callback: closeAndRefresh,
                    }
                ]}
            >
                <ExtrinsicSubmissionStateView
                    successMessage="LOC successfully created."
                />
            </ProcessStep>
        </PolkadotFrame>
    );
}
