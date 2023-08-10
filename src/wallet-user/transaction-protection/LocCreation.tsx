import { useCallback, useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LocType, Numbers, Currency } from "@logion/node-api";

import { useCommonContext } from '../../common/CommonContext';
import { LocsState, LegalOfficerClass, DraftRequest } from "@logion/client";
import Button, { Action } from '../../common/Button';
import Dialog from '../../common/Dialog';

import { useUserContext } from '../UserContext';
import ButtonGroup from "../../common/ButtonGroup";
import LocCreationForm, { FormValues } from './LocCreationForm';
import { useLogionChain } from '../../logion-chain';
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../UserRouter";
import './LocCreation.css';
import { autoSelectTemplate, backendTemplate } from 'src/loc/Template';
import LocTemplateChooser from 'src/loc/LocTemplateChooser';
import IdentityLocCreation from '../IdentityLocCreation';

export interface Props {
    locType: LocType;
    requestButtonLabel?: string;
    renderButton?: (onClick: () => void) => React.ReactNode;
    templateId?: string;
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
            valueFee: {
                unit: Numbers.NONE,
                value: "0",
            }
        }
    });
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<LegalOfficerClass | undefined>();
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | undefined>();
    const [ currentLocType, setCurrentLocType ] = useState<LocType>();

    const legalOfficersWithValidIdentityLoc = useMemo(
        () => (locsState && !locsState.discarded) ? locsState.legalOfficersWithValidIdentityLoc : undefined,
        [ locsState ]
    );

    useEffect(() => {
        if(currentLocType !== props.locType || (props.templateId && selectedTemplateId !== props.templateId)) {
            setCurrentLocType(props.locType);
            setSelectedTemplateId(props.templateId || autoSelectTemplate(props.locType));
        }
    }, [ currentLocType, selectedTemplateId, props.locType, props.templateId ]);

    const clear = useCallback(() => {
        reset();
        setRequestLoc(false);
        setSelectedTemplateId(autoSelectTemplate(props.locType));
    }, [ reset, props.locType ]);

    const submit = useCallback(async (formValues: FormValues) => {
        let draftRequest: DraftRequest;
        await mutateLocsState(async (locsState: LocsState) => {
            if(locType === "Transaction") {
                draftRequest = await locsState!.requestTransactionLoc({
                    legalOfficer: selectedLegalOfficer!,
                    description: formValues.description,
                    draft: true,
                    template: backendTemplate(selectedTemplateId),
                }) as DraftRequest;
            } else if(locType === "Identity") {
                draftRequest = await locsState!.requestIdentityLoc({
                    legalOfficer: selectedLegalOfficer!,
                    description: formValues.description,
                    draft: true,
                    template: backendTemplate(selectedTemplateId),
                    userIdentity: {
                        email: "",
                        firstName: "",
                        lastName: "",
                        phoneNumber: "",
                    },
                    userPostalAddress: {
                        line1: "",
                        line2: "",
                        postalCode: "",
                        city: "",
                        country: "",
                    }
                }) as DraftRequest;
            } else if(locType === "Collection") {
                draftRequest = await locsState!.requestCollectionLoc({
                    legalOfficer: selectedLegalOfficer!,
                    description: formValues.description,
                    draft: true,
                    template: backendTemplate(selectedTemplateId),
                    valueFee: Currency.toCanonicalAmount(new Numbers.PrefixedNumber(formValues.valueFee.value, formValues.valueFee.unit)),
                }) as DraftRequest;
            } else {
                throw new Error("Unsupported LOC type");
            }
            return draftRequest.locsState();
        });
        clear();
        navigate(locDetailsPath(draftRequest!.locId, locType));
    }, [ selectedLegalOfficer, locType, mutateLocsState, clear, navigate, selectedTemplateId ]);

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
                    <h3>{ locType } LOC Request</h3>
                    <p className="info-text">To submit a { locType } LOC request, you must select a Logion Legal Officer who already executed
                        an Identity LOC linked to your Polkadot address.</p>
                    <p className="info-text">Please request an Identity LOC to the Logion Legal Officer of your choice:</p>
                </Dialog>
            }
            { legalOfficersWithValidIdentityLoc?.length > 0 && requestLoc && selectedTemplateId === undefined &&
                <LocTemplateChooser
                    show={ legalOfficersWithValidIdentityLoc?.length > 0 && requestLoc && selectedTemplateId === undefined }
                    locType={ props.locType }
                    onCancel={ clear }
                    onSelect={ value => setSelectedTemplateId(value) }
                    selected={ selectedTemplateId }
                />
            }
            { legalOfficersWithValidIdentityLoc?.length > 0 && selectedTemplateId !== undefined &&
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
                        showValueFee={ props.locType === "Collection" }
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
