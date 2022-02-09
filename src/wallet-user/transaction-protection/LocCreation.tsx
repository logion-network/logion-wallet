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
import { DataLocType } from "../../logion-chain/Types";

function shouldShowIdentityFields(
    legalOfficer: string | undefined,
    recoveryConfig: Option<RecoveryConfig> | null
): boolean {
    if(recoveryConfig === null || recoveryConfig.isNone) {
        return true;
    } else if(legalOfficer === undefined || legalOfficer === "") {
        return false;
    } else {
        return !recoveryConfig.unwrap().friends.toArray().map(accountId => accountId.toString()).includes(legalOfficer);
    }
}

export interface Props {
    locType: DataLocType
}

export default function LocCreation(props: Props) {
    const { colorTheme, accounts, refresh, axiosFactory } = useCommonContext();
    const { recoveryConfig } = useUserContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
    const { locType } = props;
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
            <Button onClick={() => setRequestLoc(true)}>Request a Transaction Protection</Button>
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
