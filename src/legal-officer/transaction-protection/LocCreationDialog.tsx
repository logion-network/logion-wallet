 import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCommonContext } from '../../common/CommonContext';
import { CreateLocRequest, createLocRequest } from '../../common/Model';
import Dialog from '../../common/Dialog';
import LocCreationForm, { FormValues } from "./LocCreationForm";
import { isLogionIdentityLoc, LocRequest, LocRequestFragment } from "../../common/types/ModelTypes";
import LocCreationSteps from "./LocCreationSteps";
import { useLegalOfficerContext } from '../LegalOfficerContext';
import Alert from '../../common/Alert';

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
        let userIdentity = props.locRequest.userIdentity;
        if(!userIdentity) {
            userIdentity = {
                firstName: formValues.firstName!,
                lastName: formValues.lastName!,
                email: formValues.email!,
                phoneNumber: formValues.phone!,
            }
        }
        (async function () {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: currentAddress,
                requesterAddress: props.locRequest.requesterAddress ? props.locRequest.requesterAddress : undefined,
                requesterIdentityLoc: props.locRequest.requesterIdentityLoc ? props.locRequest.requesterIdentityLoc : undefined,
                locType: props.locRequest.locType,
                description: formValues.description,
                userIdentity: userIdentity,
            }
            setNewLocRequest(await createLocRequest(axios!, request));
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
                <h3>Create a new {props.locRequest.requesterAddress !== undefined ? 'Polkadot' : 'Logion'} {props.locRequest.locType} LOC</h3>
                {
                    props.locRequest.locType === 'Identity' && !isLogionIdentityLoc(props.locRequest) &&
                    <Alert
                        variant="info"
                    >
                        Important: use this specific type of LOC to authenticate the identity of a given person.
                        This authentication must follow a proper due diligence using tools and processes defined by
                        and under the responsibility of the Logion Officer.
                    </Alert>
                }
                {
                    isLogionIdentityLoc(props.locRequest) &&
                    <Alert
                        variant="info"
                    >
                        A logion Identity LOC must be used when your client cannot have a Polkadot account to request your services. Once closed after a proper identity check, you are able to initiate legal services requests ON BEHALF of this Logion Identity LOC, representing - on the blockchain-, by extension, the client it refers.
                    </Alert>
                }
                { newLocRequest === null &&
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    hasLinkNature={ props.hasLinkNature }
                    showIdentityFields={ !props.locRequest.userIdentity }
                />
                }
                { newLocRequest !== null &&
                <LocCreationSteps
                    requestToCreate={ newLocRequest }
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
