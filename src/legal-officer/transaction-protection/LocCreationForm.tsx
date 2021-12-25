import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';
import FormGroup from '../../common/FormGroup';

export interface FormValues {
    description: string;
    linkNature: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    hasLinkNature: boolean;
    showIdentityFields: boolean;
}

export default function LocCreationForm(props: Props) {

    return (
        <>
            <FormGroup
                id="locDescription"
                label="LOC Private Description"
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
            { props.hasLinkNature &&
            <FormGroup
                id="linkNature"
                label="Link Public Description"
                control={
                    <Controller
                        name="linkNature"
                        control={ props.control }
                        defaultValue=""
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.linkNature?.message}
                                type="text" placeholder="e.g. XYZ"
                                aria-describedby="linkNature"
                                { ...field }
                            />
                        )}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.linkNature?.message }
            />
            }
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
