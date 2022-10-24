import { useCallback, useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LocType } from "@logion/node-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import { LocsState, LegalOfficer } from "@logion/client";
import Button, { Action } from '../../common/Button';
import Dialog from '../../common/Dialog';

import { useUserContext } from '../UserContext';
import ButtonGroup from "../../common/ButtonGroup";
import LocCreationForm, { FormValues } from './LocCreationForm';
import { useLogionChain } from '../../logion-chain';
import { useNavigate } from "react-router-dom";
import { IDENTITY_REQUEST_PATH } from "../UserRouter";
import './LocCreation.css';

export interface Props {
    locType: LocType,
    requestButtonLabel: string
}

export default function LocCreation(props: Props) {
    const { getOfficer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { locsState, mutateLocsState } = useUserContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
    const { locType, requestButtonLabel } = props;
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
        defaultValues: {
            description: "",
            legalOfficer: "",
        }
    });
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<LegalOfficer | undefined>();
    const legalOfficersWithValidIdentityLoc = useMemo(
        () => locsState?.legalOfficersWithValidIdentityLoc,
        [ locsState?.legalOfficersWithValidIdentityLoc ]
    );

    const clear = useCallback(() => {
        reset();
        setRequestLoc(false)
    }, [ reset ]);

    const submit = useCallback(async (formValues: FormValues) => {
        await mutateLocsState(async (locsState: LocsState) => {
            return (await locsState!.requestLoc({
                legalOfficer: selectedLegalOfficer!,
                description: formValues.description,
                locType,
                draft: false,
            })).locsState();
        });
        clear();
    }, [ selectedLegalOfficer, locType, mutateLocsState, clear ]);

    const requestIdLoc = useCallback(() => {
        clear();
        navigate(IDENTITY_REQUEST_PATH);
    }, [ clear, navigate ])

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

    const requestIdLocAction: Action = {
        id: "requestIdLoc",
        callback: requestIdLoc,
        buttonText: 'Request an Identity Case',
        buttonVariant: 'primary',
        type: 'button',
    };

    const cancelAction: Action = {
        id: "cancel",
        callback: clear,
        buttonText: 'Cancel',
        buttonVariant: 'secondary',
        type: "button",
    };

    return (
        <>
            <Button onClick={ () => setRequestLoc(true) }>{ requestButtonLabel }</Button>
            { legalOfficersWithValidIdentityLoc?.length === 0 &&
                <Dialog
                    className="LocCreation"
                    show={ requestLoc }
                    size="lg"
                    actions={ [ cancelAction, requestIdLocAction ] }
                >
                    <h3>{ locType } LOC Request</h3>
                    <p className="info-text">To submit a { locType } LOC request, you must select a Logion Legal Officer who already executed
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
                    <h3>{ locType } LOC Request</h3>
                    <LocCreationForm
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
