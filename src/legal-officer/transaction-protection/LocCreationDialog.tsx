import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCommonContext } from '../../common/CommonContext';
import { CreateLocRequest, createLocRequest } from '../../common/Model';
import Dialog from '../../common/Dialog';
import LocCreationForm, { FormValues } from "./LocCreationForm";
import { LocRequest } from "../../common/types/ModelTypes";
import LocCreationSteps from "./LocCreationSteps";
import { useLegalOfficerContext } from '../LegalOfficerContext';
import UserIdentity from '../../common/types/Identity';
import { LocType } from '../../logion-chain/Types';
import Alert from '../../common/Alert';

export interface LocRequestFragment {
    requesterAddress: string;
    locType: LocType;
    userIdentity?: UserIdentity;
}

export interface Props {
    show: boolean,
    exit: () => void,
    onSuccess: (locRequest: LocRequest, nature?: string) => void,
    locRequest: LocRequestFragment;
    hasLinkNature: boolean;
}

export default function LocCreationDialog(props: Props) {
    const { colorTheme, accounts, refresh } = useCommonContext();
    const { axios } = useLegalOfficerContext();
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            description: ""
        }
    });
    const [ newLocRequest, setNewLocRequest ] = useState<LocRequest | null>(null);
    const [ linkNature, setLinkNature ] = useState<string | undefined>();

    const submit = useCallback((formValues: FormValues) => {
        (async function () {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: currentAddress,
                requesterAddress: props.locRequest.requesterAddress,
                description: formValues.description,
                userIdentity: props.locRequest.userIdentity,
                locType: props.locRequest.locType,
            }
            setNewLocRequest(await createLocRequest!(axios!, request));
            if(props.hasLinkNature) {
                setLinkNature(formValues.linkNature);
            }
            refresh()
        })();
    }, [ axios, accounts, props.locRequest, refresh, props.hasLinkNature ]);

    return (
        <>
            <Dialog
                show={ props.show }
                size="lg"
                actions={ [
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    },
                    {
                        id: "cancel",
                        callback: () => {
                            reset();
                            props.exit();
                        },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <h3>Create a new {props.locRequest.locType} LOC</h3>
                {
                    props.locRequest.locType === 'Identity' &&
                    <Alert
                        variant="info"
                    >
                        Important: use this specific type of LOC to authenticate the identity of a given person.
                        This authentication must follow a proper due diligence using tools and processes defined by
                        and under the responsibility of the Logion Officer.
                    </Alert>
                }
                { newLocRequest === null &&
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    hasLinkNature={ props.hasLinkNature }
                />
                }
                { newLocRequest !== null &&
                <LocCreationSteps
                    requestToCreate={ newLocRequest }
                    locType={ props.locRequest.locType }
                    exit={ () => {
                        props.exit();
                        reset();
                    } }
                    onSuccess={ () => props.onSuccess(newLocRequest, linkNature) }
                />
                }
            </Dialog>
        </>
    );
}
