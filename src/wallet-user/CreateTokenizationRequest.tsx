import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import moment from 'moment';

import {CreateTokenRequest} from "./Model";
import {useUserContext} from "./UserContext";
import { sign } from '../logion-chain';

export interface Props {
    onSubmit: () => void;
    onCancel: () => void;
}

export default function CreateTokenizationRequest(props: Props) {

    interface FormValues {
        requestedTokenName: string,
        bars: number,
    }

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const { legalOfficerAddress, userAddress, createTokenRequest } = useUserContext();

    const submit = async (formValues: FormValues) => {
        const attributes = [
            `${legalOfficerAddress}`,
            `${formValues.requestedTokenName}`,
            `${formValues.bars}`
        ];
        const signedOn = moment();
        const signature = await sign({
            signerId: userAddress,
            resource: 'token-request',
            operation: 'create',
            signedOn,
            attributes,
        });
        const request: CreateTokenRequest = {
            legalOfficerAddress: legalOfficerAddress,
            requesterAddress: userAddress,
            bars: Number(formValues.bars),
            requestedTokenName: formValues.requestedTokenName,
            signature,
            signedOn,
        }
        await createTokenRequest!(request);
        props.onSubmit();
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <Form.Group controlId="requestedTokenName">
                <Form.Label>Token Name</Form.Label>
                <Controller
                    name="requestedTokenName"
                    control={control}
                    defaultValue=""
                    rules={{
                            required: 'The token name is required',
                            minLength: {
                                value: 3,
                                message: 'The token name must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The token name must contain at most 40 characters'
                            }
                    }}
                    render={({ field }) => <Form.Control isInvalid={!!errors.requestedTokenName?.message} type="text" placeholder="e.g. XYZ" data-testid="tokenName" {...field} />}
                  />
                  <Form.Control.Feedback type="invalid" data-testid="tokenNameMessage">{errors.requestedTokenName?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="bars">
                <Form.Label>Number of Gold Bars</Form.Label>
                <Controller
                    name="bars"
                    control={control}
                    defaultValue=""
                    rules={{
                        required: 'The # of bars is required',
                        min: {
                            value: 1,
                            message: 'The # of bars must be greater or equal to 1'
                        },
                        max: {
                            value: 100,
                            message: 'The # of bars must not be greater than 100'
                        }
                    }}
                    render={({ field }) => <Form.Control isInvalid={!!errors.bars?.message} type="number" placeholder="e.g. 3" data-testid="bars" {...field} />}
                  />
                  <Form.Control.Feedback type="invalid" data-testid="barsMessage">{errors.bars?.message}</Form.Control.Feedback>
            </Form.Group>

            <ButtonGroup>
                <Button type="submit" variant="primary" data-testid="btnSubmit">Submit</Button>
                <Button variant="secondary" data-testid="btnCancel" onClick={props.onCancel}>Cancel</Button>
            </ButtonGroup>
        </Form>
    )
}
