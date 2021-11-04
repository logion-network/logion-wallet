import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Option } from '@polkadot/types';

import { useCommonContext } from '../../common/CommonContext';
import { CreateLocRequest, createLocRequest } from '../../common/Model';
import Button from '../../common/Button';
import Dialog from '../../common/Dialog';

import { useUserContext } from '../UserContext';

import LocCreationForm, { FormValues } from './LocCreationForm';
import { RecoveryConfig } from '../../logion-chain/Recovery';
import UserIdentity from '../../common/types/Identity';

function shouldShowIdentityFields(
    legalOfficer: string | null,
    recoveryConfig: Option<RecoveryConfig> | null
): boolean {
    if(recoveryConfig === null || recoveryConfig.isNone) {
        return true;
    } else if(legalOfficer === null || legalOfficer === "") {
        return false;
    } else {
        return !recoveryConfig.unwrap().friends.toArray().map(accountId => accountId.toString()).includes(legalOfficer);
    }
}

export default function LocCreation() {
    const { colorTheme, accounts, refresh, axiosFactory } = useCommonContext();
    const { recoveryConfig } = useUserContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
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
    const [ selectedLegalOfficer, setSelectedLegalOfficer ] = useState<string | null>(null);

    const showIdentityFields = shouldShowIdentityFields(selectedLegalOfficer, recoveryConfig);

    const submit = useCallback((formValues: FormValues) => {
        let userIdentity: UserIdentity | undefined;
        if(showIdentityFields) {
            userIdentity = {
                firstName: formValues.firstName || "",
                lastName: formValues.lastName || "",
                email: formValues.email || "",
                phoneNumber: formValues.phone || "",
            }
        }

        (async function() {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: formValues.legalOfficer,
                requesterAddress: currentAddress,
                description: formValues.description,
                locType: 'Transaction',
                userIdentity,
            }
            await createLocRequest!(axiosFactory!(formValues.legalOfficer), request);
            setRequestLoc(false);
            reset();
            refresh!();
        })();
    }, [ axiosFactory, accounts, setRequestLoc, refresh, reset, showIdentityFields ]);

    useEffect(() => {
        const subscription = watch(({ legalOfficer }) => setSelectedLegalOfficer(legalOfficer));
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <>
            <Button onClick={() => setRequestLoc(true)}>Request a Transaction Protection</Button>
            <Dialog
                show={ requestLoc }
                size="lg"
                actions={[
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    },
                    {
                        id: "cancel",
                        callback: () => { reset() ; setRequestLoc(false) },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ]}
                onSubmit={handleSubmit(submit)}
            >
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    legalOfficer={ selectedLegalOfficer }
                    showIdentityFields={ showIdentityFields }
                />
            </Dialog>
        </>
    );
}
