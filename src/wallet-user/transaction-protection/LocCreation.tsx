import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LocType } from "@logion/node-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import { LocsState, LegalOfficer } from "@logion/client";
import Button, { Action } from '../../common/Button';
import Dialog from '../../common/Dialog';

import { useUserContext } from '../UserContext';

import LocCreationForm, { FormValues } from './LocCreationForm';
import { useLogionChain } from '../../logion-chain';
import IconTextRow from "../../common/IconTextRow";
import Icon from "../../common/Icon";
import { useNavigate } from "react-router-dom";
import { IDENTITY_REQUEST_PATH } from "../UserRouter";
import './LocCreation.css';

export interface Props {
    locType: LocType,
    requestButtonLabel: string
}

type ValidIdentityLoc = "Unknown" | "OK" | "KO";

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
            firstName: "",
            lastName: "",
            email: "",
            phone: ""
        }
    });
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<LegalOfficer | undefined>();
    const [ validIdentityLoc, setValidIdentityLoc ] = useState<ValidIdentityLoc>("Unknown");

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
                const officer = getOfficer(legalOfficer);
                setSelectedLegalOfficer(officer);
                if (officer !== undefined) {
                    if (locsState.hasValidIdentityLoc(officer)) {
                        setValidIdentityLoc("OK");
                    } else {
                        setValidIdentityLoc("KO");
                    }
                } else {
                    setValidIdentityLoc("Unknown");
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [ watch, getOfficer, locsState, setSelectedLegalOfficer, setValidIdentityLoc ]);

    const cancelSubmit: Action[] = [
        {
            id: "cancel",
            callback: clear,
            buttonText: 'Cancel',
            buttonVariant: 'secondary',
        },
        {
            id: "submit",
            buttonText: 'Submit',
            buttonVariant: 'primary',
            type: 'submit',
            disabled: validIdentityLoc !== "OK"
        },
    ];

    const cancelSubmitRequest: Action[] = [ ...cancelSubmit,
        {
            id: "requestIdLoc",
            callback: requestIdLoc,
            buttonText: 'Request an Identity Case',
            buttonVariant: 'primary',
            type: 'button',
        },
    ];
    
    return (
        <>
            <Button onClick={ () => setRequestLoc(true) }>{ requestButtonLabel }</Button>
            <Dialog
                className="LocCreation"
                show={ requestLoc }
                size="lg"
                actions={ validIdentityLoc === "KO" ? cancelSubmitRequest : cancelSubmit }
                onSubmit={handleSubmit(submit)}
            >
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    legalOfficer={ selectedLegalOfficer?.address || null }
                />
                { validIdentityLoc === "OK" &&
                    <IconTextRow icon={ <Icon icon={ { id: "ok" } } /> }
                                 className="id-loc-status"
                                 text={
                                     <p>{ selectedLegalOfficer?.name } has a closed Identity Case<br />
                                         linked to your Polkadot account.</p>
                                 } />
                }
                { validIdentityLoc === "KO" &&
                    <IconTextRow icon={ <Icon icon={ { id: "ko" } } /> }
                                 className="id-loc-status"
                                 text={
                                     <p>{ selectedLegalOfficer?.name } has no closed Identity Case linked to your
                                         Polkadot account.<br />
                                         You can request one or choose another Legal officer.</p>
                                 } />
                }
                { validIdentityLoc === "Unknown" &&
                    <p>Please choose a Legal Officer.</p>
                }
            </Dialog>
        </>
    );
}
