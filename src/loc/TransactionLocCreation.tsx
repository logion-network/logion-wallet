import { useCallback, useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Numbers, Lgnt } from "@logion/node-api";

import { useCommonContext } from '../common/CommonContext';
import { LocsState, LegalOfficerClass, DraftRequest } from "@logion/client";
import Button, { Action } from '../common/Button';
import Dialog from '../common/Dialog';

import { useUserContext } from '../wallet-user/UserContext';
import ButtonGroup from "../common/ButtonGroup";
import TransactionLocRequestForm, { FormValues } from './TransactionLocRequestForm';
import { useLogionChain } from '../logion-chain';
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../wallet-user/UserRouter";
import './TransactionLocCreation.css';
import IdentityLocCreation from '../wallet-user/IdentityLocCreation';

export interface Props {
    requestButtonLabel?: string;
    renderButton?: (onClick: () => void) => React.ReactNode;
}

export default function TransactionLocCreation(props: Props) {
    const { getOfficer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { locsState, mutateLocsState } = useUserContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
    const { requestButtonLabel } = props;
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
        defaultValues: {
            description: "",
            legalOfficer: "",
            legalFee: undefined,
        }
    });
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<LegalOfficerClass | undefined>();

    const legalOfficersWithValidIdentityLoc = useMemo(
        () => (locsState && !locsState.discarded) ? locsState.legalOfficersWithValidIdentityLoc : undefined,
        [ locsState ]
    );

    const clear = useCallback(() => {
        reset();
        setRequestLoc(false);
    }, [ reset ]);

    const submit = useCallback(async (formValues: FormValues) => {
        let draftRequest: DraftRequest;
        await mutateLocsState(async (locsState: LocsState) => {
            draftRequest = await locsState!.requestTransactionLoc({
                legalOfficerAddress: selectedLegalOfficer!.address,
                description: formValues.description,
                draft: true,
                template: undefined,
                legalFee: formValues.legalFee ? Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.legalFee.value, formValues.legalFee.unit)) : undefined,
            }) as DraftRequest;
            return draftRequest.locsState();
        });
        clear();
        navigate(locDetailsPath(draftRequest!.locId, "Transaction"));
    }, [ selectedLegalOfficer, mutateLocsState, clear, navigate ]);

    useEffect(() => {
        if (getOfficer !== undefined && locsState !== undefined) {
            const subscription = watch(({ legalOfficer }) => {
                setSelectedLegalOfficer(getOfficer(legalOfficer));
            });
            return () => subscription.unsubscribe();
        }
    }, [ watch, getOfficer, locsState, setSelectedLegalOfficer ]);

    if (legalOfficersWithValidIdentityLoc === undefined) {
        return null;
    }

    const requestIdLocAction = <IdentityLocCreation onSelect={ clear }/>;

    const cancelAction: Action = {
        id: "cancel",
        callback: clear,
        buttonText: 'Cancel',
        buttonVariant: 'secondary',
        type: "button",
    };

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ () => setRequestLoc(true) }>{ requestButtonLabel }</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton(() => setRequestLoc(true))
            }
            { legalOfficersWithValidIdentityLoc?.length === 0 &&
                <Dialog
                    className="LocCreation"
                    show={ requestLoc }
                    size="lg"
                    actions={ [ cancelAction, requestIdLocAction ] }
                >
                    <h3>Transaction LOC Request</h3>
                    <p className="info-text">To submit a Transaction LOC request, you must select a Logion Legal Officer who already executed
                        an Identity LOC linked to your Polkadot address.</p>
                    <p className="info-text">Please request an Identity LOC to the Logion Legal Officer of your choice:</p>
                </Dialog>
            }
            { legalOfficersWithValidIdentityLoc?.length > 0 &&
                <Dialog
                    className="LocCreation"
                    show={ requestLoc }
                    size="lg"
                    actions={ selectedLegalOfficer === undefined ? [ requestIdLocAction ] : [] }
                >
                    <h3>Transaction LOC Request</h3>
                    <TransactionLocRequestForm
                        control={ control }
                        errors={ errors }
                        colors={ colorTheme.dialog }
                        legalOfficer={ selectedLegalOfficer?.address || null }
                    />
                    <ButtonGroup>
                        <Button onClick={ cancelAction.callback } variant={ cancelAction.buttonVariant }>{ cancelAction.buttonText }</Button>
                        <Button disabled={ selectedLegalOfficer === undefined } type="submit"
                                onClick={ handleSubmit(submit) }>Submit</Button>
                    </ButtonGroup>
                    { selectedLegalOfficer === undefined &&
                        <p className="info-text">If you do not see the Logion Legal officer you are looking for, please request an Identity
                            LOC to the Logion Legal Officer of your choice by clicking on the related button below:</p>
                    }
                </Dialog>
            }
        </>
    );
}
