import React, { useState } from 'react';
import {useForm, Controller} from 'react-hook-form';
import Form from "react-bootstrap/Form";

import Button from "../../component/Button";
import { ContentPane } from "../../component/Dashboard";
import Frame from "../../component/Frame";
import Alert from "../../component/Alert";
import Dialog from '../../component/Dialog';

import { CreateProtectionRequest, legalOfficers } from "./Model";
import {useUserContext} from "../UserContext";
import moment from "moment";
import {sign} from "../../logion-chain";
import {Row, Col} from "react-bootstrap";
import {useRootContext} from "../../RootContext";
import LegalOfficers from './LegalOfficers';

import './CreateProtectionRequestForm.css';
import LegalOfficer from '../../component/types/LegalOfficer';

export interface Props {
    isRecovery: boolean,
}

interface FormValues {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    line1: string,
    line2: string,
    postalCode: string,
    city: string,
    country: string,
    addressToRecover?: string,
    agree: string,
}

export default function CreateProtectionRequestForm(props: Props) {
    const { control, handleSubmit, formState: {errors} } = useForm<FormValues>();
    const { selectAddress, addresses, currentAddress } = useRootContext();
    const { createProtectionRequest, colorTheme, refreshRequests } = useUserContext();
    const [ legalOfficer1, setLegalOfficer1 ] = useState<LegalOfficer | null>(null);
    const [ legalOfficer2, setLegalOfficer2 ] = useState<LegalOfficer | null>(null);
    const [ requestCreated, setRequestCreated ] = useState<boolean>(false);

    const submit = async (formValues: FormValues) => {
        if(legalOfficer1 === null || legalOfficer2 === null || !formValues.agree) {
            return;
        }

        const addressToRecover = formValues.addressToRecover !== undefined ? formValues.addressToRecover : "";
        const attributes = [
            `${formValues.firstName}`,
            `${formValues.lastName}`,
            `${formValues.email}`,
            `${formValues.phoneNumber}`,

            `${formValues.line1}`,
            `${formValues.line2}`,
            `${formValues.postalCode}`,
            `${formValues.city}`,
            `${formValues.country}`,
            `${props.isRecovery}`,
            `${addressToRecover}`,
            `${legalOfficer1.address}`,
            `${legalOfficer2.address}`,
        ];

        const signedOn = moment();
        const signature = await sign({
            signerId: currentAddress,
            resource: 'protection-request',
            operation: 'create',
            signedOn,
            attributes,
        });
        const request: CreateProtectionRequest = {
            requesterAddress: currentAddress,
            userIdentity: {
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                email: formValues.email,
                phoneNumber: formValues.phoneNumber
            },
            userPostalAddress: {
                line1: formValues.line1,
                line2: formValues.line2,
                postalCode: formValues.postalCode,
                city: formValues.city,
                country: formValues.country,
            },
            legalOfficerAddresses: [ legalOfficer1.address, legalOfficer2.address ],
            signature,
            signedOn,
            isRecovery: props.isRecovery,
            addressToRecover: formValues.addressToRecover !== undefined ? formValues.addressToRecover : "",
        }
        await createProtectionRequest!(request);
        setRequestCreated(true);
    }

    let mainTitle;
    if(props.isRecovery) {
        mainTitle = "Recovery";
    } else {
        mainTitle = "My Logion Trust Protection";
    }

    let subTitle;
    if(props.isRecovery) {
        subTitle = "Start recovery process";
    } else {
        subTitle = "Activate my Logion Trust Protection";
    }

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryPaneWidth={ 6 }
            primaryAreaChildren={
                <Frame
                    className="CreateProtectionRequestFormLegalOfficers"
                    colors={ colorTheme }
                >
                    <h3>Choose your Legal Officers</h3>
                    {
                        props.isRecovery &&
                        <Alert variant="warning">
                            Please select the 2 legal officers you’ve selected at the creation of the account to be
                            recovered. Please note that those Legal Officers will execute their due diligence to authorize
                            the recovery and will be, then, the two Legal Officers in charge of protecting this current
                            account you are using to get your assets back.
                        </Alert>
                    }

                    <LegalOfficers
                        legalOfficers={ legalOfficers }
                        legalOfficer1={ legalOfficer1 }
                        setLegalOfficer1={ setLegalOfficer1 }
                        legalOfficer2={ legalOfficer2 }
                        setLegalOfficer2={ setLegalOfficer2 }
                        colorTheme={ colorTheme }
                        mode="choose"
                    />
                </Frame>
            }
            secondaryAreaChildren={
                <Frame
                    className="CreateProtectionRequestFormOther"
                    colors={ colorTheme }
                    disabled={ legalOfficer1 === null || legalOfficer2 === null || legalOfficer1.address === legalOfficer2.address }
                >
                    <h3>Fill in your personal information</h3>

                    {
                        !props.isRecovery &&
                        <Alert variant="info">
                            This initial personal information sharing will start KYC process and will also be used
                            in the context of a potential future recovery process.
                        </Alert>
                    }
                    {
                        props.isRecovery &&
                        <Alert variant="info">
                            This personal information sharing will start KYC process part of the recovery process.
                        </Alert>
                    }

                    <Form onSubmit={handleSubmit(submit)}>
                        {
                            props.isRecovery &&
                            <>
                                <Form.Group controlId="accountToRecover">
                                    <Form.Label>Address to Recover</Form.Label>
                                    <Controller
                                        name="addressToRecover"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The address to recover is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.addressToRecover?.message}
                                                type="text"
                                                data-testid="addressToRecover" {...field}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback
                                        type="invalid"
                                        data-testid="accountToRecoverMessage"
                                    >
                                        {errors.addressToRecover?.message}
                                   </Form.Control.Feedback>
                                </Form.Group>
                            </>
                        }

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The first name is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.firstName?.message}
                                                type="text" placeholder="e.g. XYZ"
                                                data-testid="firstName" {...field}
                                            />
                                       )}
                                    />
                                    <Form.Control.Feedback
                                        type="invalid"
                                        data-testid="firstNameMessage"
                                    >
                                        {errors.firstName?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The last name is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.lastName?.message}
                                                type="text"
                                                placeholder="e.g. XYZ"
                                                data-testid="lastName" {...field}
                                            />
                                       )}
                                    />
                                    <Form.Control.Feedback
                                        type="invalid"
                                        data-testid="lastNameMessage"
                                    >
                                        {errors.lastName?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The email is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.email?.message}
                                                type="text" placeholder="e.g. XYZ"
                                                data-testid="email" {...field}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid"
                                                           data-testid="emailMessage">{errors.email?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="phoneNumber">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The phone number is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.phoneNumber?.message}
                                                type="text"
                                                placeholder="e.g. XYZ"
                                                data-testid="phoneNumber" {...field}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback
                                        type="invalid"
                                        data-testid="phoneNumberMessage"
                                    >
                                        {errors.phoneNumber?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <h3>Address</h3>
                        <Form.Group controlId="line1">
                            <Form.Label>Line1</Form.Label>
                            <Controller name="line1"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The line1 is required'}}
                                        render={({field}) => <Form.Control isInvalid={!!errors.line1?.message}
                                                                           type="text" placeholder="e.g. XYZ"
                                                                           data-testid="line1" {...field} />}
                            />
                            <Form.Control.Feedback type="invalid"
                                                   data-testid="line1Message">{errors.line1?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="line2">
                            <Form.Label>Line2</Form.Label>
                            <Controller name="line2"
                                        control={control}
                                        defaultValue=""
                                        render={({field}) => <Form.Control isInvalid={!!errors.line2?.message}
                                                                           type="text" placeholder="e.g. XYZ"
                                                                           data-testid="line2" {...field} />}
                            />
                            <Form.Control.Feedback type="invalid"
                                                   data-testid="line2Message">{errors.line2?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                        <Col md={4}>
                        <Form.Group controlId="postalCode">
                            <Form.Label>Postal Code</Form.Label>
                            <Controller name="postalCode"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The postal code is required'}}
                                        render={({field}) => <Form.Control isInvalid={!!errors.postalCode?.message}
                                                                           type="text" placeholder="e.g. XYZ"
                                                                           data-testid="postalCode" {...field} />}
                            />
                            <Form.Control.Feedback type="invalid"
                                                   data-testid="postalCodeMessage">{errors.postalCode?.message}</Form.Control.Feedback>
                        </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group controlId="city">
                                <Form.Label>City</Form.Label>
                                <Controller name="city"
                                            control={control}
                                            defaultValue=""
                                            rules={{required: 'The city is required'}}
                                            render={({field}) => <Form.Control isInvalid={!!errors.city?.message}
                                                                               type="text" placeholder="e.g. XYZ"
                                                                               data-testid="city" {...field} />}
                                />
                                <Form.Control.Feedback type="invalid"
                                                       data-testid="cityMessage">{errors.city?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        </Row>
                        <Form.Group controlId="country">
                            <Form.Label>Country</Form.Label>
                            <Controller name="country"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The country is required'}}
                                        render={({field}) => <Form.Control isInvalid={!!errors.country?.message}
                                                                           type="text" placeholder="e.g. XYZ"
                                                                           data-testid="country" {...field} />}
                            />
                            <Form.Control.Feedback type="invalid"
                                                   data-testid="countryMessage">{errors.country?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="agree-submit">
                            <Form.Group controlId="agree">
                                <Controller
                                    name="agree"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: "You must agree in order to proceed"}}
                                    render={({field}) => (
                                        <Form.Check
                                            isInvalid={!!errors.agree?.message}
                                            type="checkbox"
                                            id="agree"
                                            label="I agree to send my personal information to the chosen Legal Officers"
                                            feedback={errors.agree?.message}
                                            { ...field }
                                        />
                                      )}
                                />
                            </Form.Group>
    
                            <Button
                                backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                                action={{
                                    id: "submit",
                                    buttonVariant: "primary",
                                    buttonText: "Next",
                                    buttonTestId: "btnSubmit"
                                }}
                                type='submit'
                            />
                        </div>
                    </Form>
                    <Dialog
                        show={ requestCreated }
                        size='lg'
                        actions={[
                            {
                                buttonText: "Nice!",
                                callback: () => { refreshRequests!(); setRequestCreated(false); },
                                id: "discard",
                                buttonVariant: 'primary'
                            }
                        ]}
                        colors={ colorTheme }
                        spaceAbove="25vh"
                    >
                        <>
                            The legal officers have been informed of your request.
                        </>
                    </Dialog>
                </Frame>
            }
        />
    );
}
