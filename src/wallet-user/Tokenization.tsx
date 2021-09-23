import React, { useState, useCallback } from "react";
import { useForm } from 'react-hook-form';

import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import Dialog from "../common/Dialog";
import { DEFAULT_LEGAL_OFFICER } from '../common/types/LegalOfficer';

import { useUserContext } from './UserContext';
import { CreateTokenRequest } from "./Model";
import TokenCreationForm from './TokenCreationForm';

import './Tokenization.css';

export enum State {
    START,
    REQUEST_TOKENIZATION
}

export interface Props {
    initialState?: State
}

interface FormValues {
    requestedTokenName: string,
    bars: number,
}

export default function Tokenization(props: Props) {
    const { accounts, colorTheme } = useCommonContext();
    const { refreshRequests, createTokenRequest } = useUserContext();
    const [state, setState] = useState(props.initialState !== null ? props.initialState : State.START)
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

    const submit = useCallback((formValues: FormValues) => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            const request: CreateTokenRequest = {
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
                requesterAddress: currentAddress,
                bars: Number(formValues.bars),
                requestedTokenName: formValues.requestedTokenName,
            }
            await createTokenRequest!(request);
            reset();
            setState(State.START);
            refreshRequests!(true);
        })();
    }, [ accounts, createTokenRequest, setState, refreshRequests, reset ]);

    return (
        <div className="Tokenization">
            <Button onClick={ () => setState(State.REQUEST_TOKENIZATION) }>
                Request token creation
            </Button>
            <Dialog
                show={ state === State.REQUEST_TOKENIZATION }
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
                        callback: () => { reset() ; setState(State.START) },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ]}
                onSubmit={handleSubmit(submit)}
            >
                <TokenCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
        </div>
    );
}
