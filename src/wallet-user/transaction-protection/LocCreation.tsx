import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RecoveryConfig } from '@logion/node-api/dist/Recovery';
import { DataLocType } from "@logion/node-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import { CreateLocRequest, createLocRequest } from '../../common/Model';
import Button from '../../common/Button';
import Dialog from '../../common/Dialog';
import UserIdentity from '../../common/types/Identity';

import { useUserContext } from '../UserContext';

import LocCreationForm, { FormValues } from './LocCreationForm';
import { useLogionChain } from '../../logion-chain';

function shouldShowIdentityFields(
    legalOfficer: string | undefined,
    recoveryConfig: RecoveryConfig | undefined | null
): boolean {
    if(!recoveryConfig) {
        return true;
    } else if(legalOfficer === undefined || legalOfficer === "") {
        return false;
    } else {
        return !recoveryConfig.legalOfficers.includes(legalOfficer);
    }
}

export interface Props {
    locType: DataLocType,
    requestButtonLabel: string
}

export default function LocCreation(props: Props) {
    const { accounts, axiosFactory } = useLogionChain();
    const { colorTheme, refresh } = useCommonContext();
    const { recoveryConfig } = useUserContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
    const { locType, requestButtonLabel } = props;
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
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<string | undefined>();

    const showIdentityFields = shouldShowIdentityFields(selectedLegalOfficer, recoveryConfig);

    const submit = useCallback(async (formValues: FormValues) => {
        let userIdentity: UserIdentity | undefined;
        if(showIdentityFields) {
            userIdentity = {
                firstName: formValues.firstName || "",
                lastName: formValues.lastName || "",
                email: formValues.email || "",
                phoneNumber: formValues.phone || "",
            }
        }

        const currentAddress = accounts!.current!.address;
        const request: CreateLocRequest = {
            ownerAddress: formValues.legalOfficer,
            requesterAddress: currentAddress,
            description: formValues.description,
            locType,
            userIdentity,
        }
        await createLocRequest!(axiosFactory!(formValues.legalOfficer), request);

        reset();
        refresh!();
        setRequestLoc(false);
    }, [ axiosFactory, accounts, setRequestLoc, refresh, reset, showIdentityFields, locType ]);

    useEffect(() => {
        const subscription = watch(({ legalOfficer }) => setSelectedLegalOfficer(legalOfficer));
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <>
            <Button onClick={ () => setRequestLoc(true) }>{ requestButtonLabel }</Button>
            <Dialog
                show={ requestLoc }
                size="lg"
                actions={[
                    {
                        id: "cancel",
                        callback: () => { reset() ; setRequestLoc(false) },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    }
                ]}
                onSubmit={handleSubmit(submit)}
            >
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    legalOfficer={ selectedLegalOfficer || null }
                    showIdentityFields={ showIdentityFields }
                />
            </Dialog>
        </>
    );
}
