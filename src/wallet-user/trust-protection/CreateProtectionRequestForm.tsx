import React, { useState, useCallback } from 'react';
import {useForm, Controller} from 'react-hook-form';
import Form from "react-bootstrap/Form";

import Button from "../../component/Button";
import { ContentPane } from "../../component/Dashboard";
import Frame from "../../component/Frame";
import Alert from "../../component/Alert";
import Dialog from '../../component/Dialog';
import FormGroup from '../../component/FormGroup';

import { CreateProtectionRequest, legalOfficers } from "./Model";
import {useUserContext} from "../UserContext";
import moment from "moment";
import {
    sign,
    useLogionChain,
} from '../../logion-chain';
import { ActiveRecovery, getActiveRecovery, initiateRecovery } from '../../logion-chain/Recovery';
import { Option } from '@polkadot/types';
import {Row, Col} from "react-bootstrap";
import {useRootContext} from "../../RootContext";
import LegalOfficers from './LegalOfficers';

import './CreateProtectionRequestForm.css';
import LegalOfficer from '../../component/types/LegalOfficer';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

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
    agree: string,
}

export default function CreateProtectionRequestForm(props: Props) {
    const { api } = useLogionChain();
    const { control, handleSubmit, formState: {errors} } = useForm<FormValues>();
    const { selectAddress, addresses, currentAddress } = useRootContext();
    const { createProtectionRequest, colorTheme, refreshRequests } = useUserContext();
    const [ legalOfficer1, setLegalOfficer1 ] = useState<LegalOfficer | null>(null);
    const [ legalOfficer2, setLegalOfficer2 ] = useState<LegalOfficer | null>(null);
    const [ addressToRecover, setAddressToRecover ] = useState<string>("");
    const [ requestCreated, setRequestCreated ] = useState<boolean>(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ activeRecovery, setActiveRecovery ] = useState<Option<ActiveRecovery> | null>(null);

    const submit = async (formValues: FormValues) => {
        if(legalOfficer1 === null || legalOfficer2 === null
            || !formValues.agree
            || (props.isRecovery && (activeRecovery === null || activeRecovery.isEmpty))) {
            return;
        }

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
            addressToRecover: addressToRecover,
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

    const initiateRecoveryOnClick = useCallback(() => {
        (async function() {
            const activeRecovery = await getActiveRecovery({
                api: api!,
                sourceAccount: addressToRecover,
                destinationAccount: currentAddress,
            });
            setActiveRecovery(activeRecovery);
            if(activeRecovery.isEmpty) {
                const signAndSubmit: SignAndSubmit = (setResult, setError) => initiateRecovery({
                    api: api!,
                    signerId: currentAddress,
                    callback: setResult,
                    errorCallback: setError,
                    addressToRecover,
                });
                setSignAndSubmit(() => signAndSubmit);
            }
        })();
    }, [ api, currentAddress, addressToRecover, setSignAndSubmit ]);

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            titleIcon={{
                id: 'shield',
                hasVariants: true,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryPaneWidth={ 6 }
            primaryAreaChildren={
                <>
                {
                    props.isRecovery &&
                    <Frame
                        className="CreateProtectionRequestFormInitiateRecovery"
                        colors={ colorTheme }
                    >
                        <h3>Initiate recovery</h3>
                        {
                            (activeRecovery === null || activeRecovery.isEmpty) &&
                            <>
                                <FormGroup
                                    id="accountToRecover"
                                    label="Address to Recover"
                                    control={
                                        <Form.Control
                                            isInvalid={ addressToRecover === null || addressToRecover === "" }
                                            type="text"
                                            data-testid="addressToRecover"
                                            value={ addressToRecover }
                                            onChange={ event => setAddressToRecover(event.target.value) }
                                        />
                                    }
                                    feedback={ "Address to recover is required" }
                                    colors={ colorTheme.dashboard }
                                />
                                <Button
                                    backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                                    onClick={ initiateRecoveryOnClick }
                                >
                                    Initiate recovery
                                </Button>
                                <ExtrinsicSubmitter
                                    id="initiateRecovery"
                                    successMessage="Recovery successfully initiated."
                                    signAndSubmit={ signAndSubmit }
                                    onSuccess={ () => { setSignAndSubmit(null); refreshRequests!(true); } }
                                    onError={ () => setSignAndSubmit(null) }
                                />
                            </>
                        }
                        {
                            (activeRecovery !== null && !activeRecovery.isEmpty) &&
                            <Alert variant="success">
                                The recovery has been successfully initiated, you may now contact your legal officers.
                            </Alert>
                        }
                    </Frame>
                }

                <Frame
                    className="CreateProtectionRequestFormLegalOfficers"
                    colors={ colorTheme }
                    disabled={ props.isRecovery && (activeRecovery === null || activeRecovery.isEmpty) }
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
                </>
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
                        <Row>
                            <Col md={6}>
                                <FormGroup
                                    id="firstName"
                                    label="First Name"
                                    control={
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
                                    }
                                    feedback={ errors.firstName?.message }
                                    colors={ colorTheme.dashboard }
                                />
                            </Col>
                            <Col md={6}>
                                <FormGroup
                                    id="lastName"
                                    label="Last Name"
                                    control={
                                        <Controller
                                            name="lastName"
                                            control={control}
                                            defaultValue=""
                                            rules={{required: 'The last name is required'}}
                                            render={({field}) => (
                                                <Form.Control
                                                    isInvalid={!!errors.lastName?.message}
                                                    type="text" placeholder="e.g. XYZ"
                                                    data-testid="lastName" {...field}
                                                />
                                           )}
                                        />
                                    }
                                    feedback={ errors.lastName?.message }
                                    colors={ colorTheme.dashboard }
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormGroup
                                    id="email"
                                    label="Email"
                                    control={
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
                                    }
                                    feedback={ errors.email?.message }
                                    colors={ colorTheme.dashboard }
                                />
                            </Col>
                            <Col md={6}>
                                <FormGroup
                                    id="phoneNumber"
                                    label="Phone Number"
                                    control={
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            defaultValue=""
                                            rules={{required: 'The phone number is required'}}
                                            render={({field}) => (
                                                <Form.Control
                                                    isInvalid={!!errors.phoneNumber?.message}
                                                    type="text" placeholder="e.g. XYZ"
                                                    data-testid="phoneNumber" {...field}
                                                />
                                           )}
                                        />
                                    }
                                    feedback={ errors.phoneNumber?.message }
                                    colors={ colorTheme.dashboard }
                                />
                            </Col>
                        </Row>

                        <h3>Address</h3>
                        <FormGroup
                            id="line1"
                            label="Line1"
                            control={
                                <Controller
                                    name="line1"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The line1 is required'}}
                                    render={({field}) => (
                                        <Form.Control
                                            isInvalid={!!errors.line1?.message}
                                            type="text" placeholder="e.g. XYZ"
                                            data-testid="line1" {...field}
                                        />
                                   )}
                                />
                            }
                            feedback={ errors.line1?.message }
                            colors={ colorTheme.dashboard }
                        />
                        <FormGroup
                            id="line2"
                            label="Line2"
                            control={
                                <Controller
                                    name="line2"
                                    control={control}
                                    defaultValue=""
                                    render={({field}) => (
                                        <Form.Control
                                            isInvalid={!!errors.line2?.message}
                                            type="text" placeholder="e.g. XYZ"
                                            data-testid="line2" {...field}
                                        />
                                   )}
                                />
                            }
                            feedback={ errors.line2?.message }
                            colors={ colorTheme.dashboard }
                        />

                        <Row>
                        <Col md={4}>
                            <FormGroup
                                id="postalCode"
                                label="Postal Code"
                                control={
                                    <Controller
                                        name="postalCode"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The postal code is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.postalCode?.message}
                                                type="text" placeholder="e.g. XYZ"
                                                data-testid="postalCode" {...field}
                                            />
                                       )}
                                    />
                                }
                                feedback={ errors.postalCode?.message }
                                colors={ colorTheme.dashboard }
                            />
                        </Col>
                        <Col md={8}>
                            <FormGroup
                                id="city"
                                label="City"
                                control={
                                    <Controller
                                        name="city"
                                        control={control}
                                        defaultValue=""
                                        rules={{required: 'The city is required'}}
                                        render={({field}) => (
                                            <Form.Control
                                                isInvalid={!!errors.city?.message}
                                                type="text" placeholder="e.g. XYZ"
                                                data-testid="city" {...field}
                                            />
                                       )}
                                    />
                                }
                                feedback={ errors.city?.message }
                                colors={ colorTheme.dashboard }
                            />
                        </Col>
                        </Row>
                        <FormGroup
                            id="country"
                            label="Country"
                            control={
                                <Controller
                                    name="country"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The country is required'}}
                                    render={({field}) => (
                                        <Form.Control
                                            isInvalid={!!errors.city?.message}
                                            type="text" placeholder="e.g. XYZ"
                                            data-testid="country" {...field}
                                        />
                                   )}
                                />
                            }
                            feedback={ errors.country?.message }
                            colors={ colorTheme.dashboard }
                        />

                        <div className="agree-submit">
                            <FormGroup
                                id="agree"
                                control={
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
                                }
                                colors={ colorTheme.dashboard }
                                noFeedback
                            />
    
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
                                buttonText: "OK",
                                callback: () => { refreshRequests!(true); setRequestCreated(false); },
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
