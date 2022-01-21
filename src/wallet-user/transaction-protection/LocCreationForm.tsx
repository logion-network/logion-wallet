import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';
import FormGroup from '../../common/FormGroup';
import Select from '../../common/Select';

import { legalOfficers } from '../../common/types/LegalOfficer';
import { buildOptions } from '../trust-protection/SelectLegalOfficer';
import { useCommonContext } from '../../common/CommonContext';

export interface FormValues {
    description: string;
    legalOfficer: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | null;
    showIdentityFields: boolean;
}

export default function LocCreationForm(props: Props) {
    const { nodesDown } = useCommonContext();

    return (
        <>
            <FormGroup
                id="locDescription"
                label="Description"
                control={
                    <Controller
                        name="description"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'The description is required',
                            minLength: {
                                value: 3,
                                message: 'The description must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The description must contain at most 40 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.description?.message}
                                type="text" placeholder="e.g. XYZ"
                                data-testid="description"
                                aria-describedby="locDescription"
                                { ...field }
                            />
                        )}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.description?.message }
            />

            <FormGroup
                id={ `locOwner` }
                label="Legal officer"
                control={
                    <Controller
                        name="legalOfficer"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'You must select a Legal Officer',
                            minLength: {
                                value: 1,
                                message: 'You must select a Legal Officer'
                            },
                            
                        }}
                        render={({ field }) => (
                            <Select
                                isInvalid={ !!props.errors.legalOfficer?.message }
                                options={ buildOptions(legalOfficers(nodesDown)) }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        )}
                      />
                }
                feedback={ props.errors.legalOfficer?.message }
                colors={ props.colors }
            />

            {
                props.showIdentityFields &&
                <>
                    <FormGroup
                        id="firstName"
                        label="First Name"
                        control={
                            <Controller
                                name="firstName"
                                control={ props.control }
                                defaultValue=""
                                rules={{
                                    required: 'First name is required'
                                }}
                                render={({ field }) => (
                                    <Form.Control
                                        isInvalid={!!props.errors.firstName?.message}
                                        type="text"
                                        data-testid="firstName"
                                        aria-describedby="firstName"
                                        { ...field }
                                    />
                                )}
                              />
                        }
                        colors={ props.colors }
                        feedback={ props.errors.firstName?.message }
                    />

                    <FormGroup
                        id="lastName"
                        label="Last Name"
                        control={
                            <Controller
                                name="lastName"
                                control={ props.control }
                                defaultValue=""
                                rules={{
                                    required: 'Last name is required'
                                }}
                                render={({ field }) => (
                                    <Form.Control
                                        isInvalid={!!props.errors.lastName?.message}
                                        type="text"
                                        data-testid="lastName"
                                        aria-describedby="lastName"
                                        { ...field }
                                    />
                                )}
                              />
                        }
                        colors={ props.colors }
                        feedback={ props.errors.lastName?.message }
                    />

                    <FormGroup
                        id="email"
                        label="E-mail"
                        control={
                            <Controller
                                name="email"
                                control={ props.control }
                                defaultValue=""
                                rules={{
                                    required: 'E-mail is required'
                                }}
                                render={({ field }) => (
                                    <Form.Control
                                        isInvalid={!!props.errors.email?.message}
                                        type="text"
                                        data-testid="email"
                                        aria-describedby="email"
                                        { ...field }
                                    />
                                )}
                              />
                        }
                        colors={ props.colors }
                        feedback={ props.errors.email?.message }
                    />

                    <FormGroup
                        id="phone"
                        label="Phone"
                        control={
                            <Controller
                                name="phone"
                                control={ props.control }
                                defaultValue=""
                                rules={{
                                    required: 'Phone is required'
                                }}
                                render={({ field }) => (
                                    <Form.Control
                                        isInvalid={!!props.errors.phone?.message}
                                        type="text"
                                        data-testid="phone"
                                        aria-describedby="phone"
                                        { ...field }
                                    />
                                )}
                              />
                        }
                        colors={ props.colors }
                        feedback={ props.errors.phone?.message }
                    />
                </>
            }
        </>
    )
}
