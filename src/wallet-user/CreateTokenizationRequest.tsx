import React from 'react';
import {useForm} from 'react-hook-form';
import Button from "react-bootstrap/Button";
import {CreateTokenRequest} from "./Model";
import {useUserContext} from "./UserContext";
import { signString } from '../logion-chain';

export interface Props {
    onSubmit: () => void;
    onCancel: () => void;
}

export default function CreateTokenizationRequest(props: Props) {

    interface FormValues {
        requestedTokenName: string,
        bars: number,
    }

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const { legalOfficerAddress, userAddress, createTokenRequest } = useUserContext();

    const submit = async (formValues: FormValues) => {
        const message = `${legalOfficerAddress}-${userAddress}-${formValues.requestedTokenName}-${formValues.bars}`;
        const signature = await signString({
            signerId: userAddress,
            message
        });
        const request: CreateTokenRequest = {
            legalOfficerAddress: legalOfficerAddress,
            requesterAddress: userAddress,
            bars: formValues.bars,
            requestedTokenName: formValues.requestedTokenName,
            signature
        }
        createTokenRequest!(request);
        props.onSubmit();
    }

    return (
        <form onSubmit={handleSubmit(submit)}>
            <input
                data-testid="tokenName"
                type="text"
                placeholder="Token name"
                {...register("requestedTokenName", {
                    required: 'The token name is required',
                    minLength: {
                        value: 4,
                        message: 'The token name must contain at least 4 characters'
                    },
                    maxLength: {
                        value: 40,
                        message: 'The token name must contain at most 40 characters'
                    }
                })}
            />
            <p data-testid="tokenNameMessage">{errors.requestedTokenName?.message}</p>
            <input
                data-testid="bars"
                type="number"
                placeholder="Number of Gold Bars"
                {...register("bars", {
                    required: 'The # of bars is required',
                    valueAsNumber: true,
                    min: {
                        value: 1,
                        message: 'The # of bars must be greater or equal to 1'
                    },
                    max: {
                        value: 100,
                        message: 'The # of bars must not be greater than 100'
                    }
                })}
            />
            <p data-testid="barsMessage">{errors.bars?.message}</p>
            <Button type="submit" data-testid="btnSubmit">Submit</Button>
            <Button data-testid="btnCancel" onClick={props.onCancel}>Cancel</Button>
        </form>
    )
}
