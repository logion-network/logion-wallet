import { useState, useEffect } from 'react';
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useForm, Controller } from 'react-hook-form';
import { LegalOfficer } from "@logion/client";

import Button from "../../common/Button";
import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Alert from "../../common/Alert";
import Dialog from '../../common/Dialog';
import FormGroup from '../../common/FormGroup';
import NetworkWarning from '../../common/NetworkWarning';
import { useCommonContext } from "../../common/CommonContext";

import { useUserContext } from "../UserContext";
import { useLogionChain } from '../../logion-chain';
import ClientExtrinsicSubmitter, { Call, CallCallback } from '../../ClientExtrinsicSubmitter';
import { SETTINGS_PATH } from '../UserRouter';

import LegalOfficers from './LegalOfficers';

import './CreateProtectionRequestForm.css';

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
    const { api, client } = useLogionChain();
    const { control, handleSubmit, formState: {errors} } = useForm<FormValues>();
    const { colorTheme, nodesDown, availableLegalOfficers } = useCommonContext();
    const { createProtectionRequest, refreshRequests } = useUserContext();
    const [ legalOfficer1, setLegalOfficer1 ] = useState<LegalOfficer | null>(null);
    const [ legalOfficer2, setLegalOfficer2 ] = useState<LegalOfficer | null>(null);
    const [ addressToRecover, setAddressToRecover ] = useState<string>("");
    const [ addressToRecoverError, setAddressToRecoverError ] = useState<string>("");
    const [ requestCreated, setRequestCreated ] = useState<boolean>(false);
    const [ call, setCall ] = useState<Call>();

    const submit = async (formValues: FormValues) => {
        if(legalOfficer1 === null || legalOfficer2 === null
            || !formValues.agree
            || (props.isRecovery && addressToRecoverError !== "")) {
            return;
        }

        if(props.isRecovery) {
            const call = async (callback: CallCallback) => {
                await createProtectionRequest!({
                    legalOfficers: [
                        legalOfficer1,
                        legalOfficer2
                    ],
                    postalAddress: {
                        line1: formValues.line1,
                        line2: formValues.line2,
                        postalCode: formValues.postalCode,
                        city: formValues.city,
                        country: formValues.country,
                    },
                    userIdentity: {
                        firstName: formValues.firstName,
                        lastName: formValues.lastName,
                        email: formValues.email,
                        phoneNumber: formValues.phoneNumber
                    },
                    addressToRecover,
                    callback,
                });
            };
            setCall(() => call);
        } else {
            await createProtectionRequest!({
                legalOfficers: [
                    legalOfficer1,
                    legalOfficer2
                ],
                postalAddress: {
                    line1: formValues.line1,
                    line2: formValues.line2,
                    postalCode: formValues.postalCode,
                    city: formValues.city,
                    country: formValues.country,
                },
                userIdentity: {
                    firstName: formValues.firstName,
                    lastName: formValues.lastName,
                    email: formValues.email,
                    phoneNumber: formValues.phoneNumber
                },
                addressToRecover: undefined,
            });
            setRequestCreated(true);
        }
    }

    let mainTitle;
    if(props.isRecovery) {
        mainTitle = "Recovery";
    } else {
        mainTitle = "My Logion Protection";
    }

    let subTitle;
    if(props.isRecovery) {
        subTitle = "Start recovery process";
    } else {
        subTitle = "Activate my Logion Protection";
    }

    useEffect(() => {
        if(!props.isRecovery) {
            setAddressToRecoverError("");
        } else {
            if(client !== null && client.isValidAddress(addressToRecover)) {
                setAddressToRecoverError("Checking recovery config...");
                (async function() {
                    if(await client.isProtected(addressToRecover)) {
                        setAddressToRecoverError("");
                    } else {
                        setAddressToRecoverError("This SS58 address is not set up for recovery");
                    }
                })();
            } else {
                setAddressToRecoverError("A valid SS58 address is required");
            }
        }
    }, [ api, addressToRecover, client, props.isRecovery ])

    let legalOfficersTitle;
    if(props.isRecovery) {
        legalOfficersTitle = "Select your Legal Officers";
    } else {
        legalOfficersTitle = "Choose your Legal Officers";
    }

    if(availableLegalOfficers === undefined) {
        return null;
    }

    return (
        <FullWidthPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            titleIcon={{
                icon: {
                    id: props.isRecovery ? 'recovery' : 'shield',
                    hasVariants: props.isRecovery ? false : true,
                },
                background: props.isRecovery ? colorTheme.recoveryItems.iconGradient : undefined,
            }}
        >
            {
                nodesDown.length > 0 &&
                <Row>
                    <Col>
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    </Col>
                </Row>
            }
            <Row>
                <Col md={6}>
                    {
                        props.isRecovery &&
                        <Frame
                            className="CreateProtectionRequestFormInitiateRecovery"
                        >
                            <h3>Initiate recovery</h3>
                            <FormGroup
                                id="accountToRecover"
                                label="Address to Recover"
                                control={
                                    <Form.Control
                                        isInvalid={ addressToRecoverError !== "" }
                                        type="text"
                                        data-testid="addressToRecover"
                                        value={ addressToRecover }
                                        onChange={ event => setAddressToRecover(event.target.value) }
                                    />
                                }
                                feedback={ addressToRecoverError }
                                colors={ colorTheme.frame }
                            />
                        </Frame>
                    }

                    <Frame
                        className="CreateProtectionRequestFormLegalOfficers"
                        disabled={ addressToRecoverError !== "" }
                    >
                        <h3>{ legalOfficersTitle }</h3>
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
                            legalOfficers={ availableLegalOfficers }
                            legalOfficer1={ legalOfficer1 }
                            setLegalOfficer1={ setLegalOfficer1 }
                            legalOfficer2={ legalOfficer2 }
                            setLegalOfficer2={ setLegalOfficer2 }
                            mode={ props.isRecovery ? 'select' : 'choose' }
                        />
                    </Frame>
                </Col>
                <Col md={6}>
                    <Frame
                        className="CreateProtectionRequestFormOther"
                        disabled={ legalOfficer1 === null || legalOfficer2 === null || legalOfficer1.address === legalOfficer2.address || addressToRecoverError !== "" }
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
                                        colors={ colorTheme.frame }
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
                                        colors={ colorTheme.frame }
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
                                        colors={ colorTheme.frame }
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
                                        colors={ colorTheme.frame }
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
                                colors={ colorTheme.frame }
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
                                colors={ colorTheme.frame }
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
                                    colors={ colorTheme.frame }
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
                                    colors={ colorTheme.frame }
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
                                colors={ colorTheme.frame }
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
                                    colors={ colorTheme.frame }
                                    noFeedback
                                />
                                <ClientExtrinsicSubmitter
                                    successMessage="Recovery successfully initiated."
                                    call={ call }
                                    onSuccess={ () => setRequestCreated(true) }
                                />

                                <Button
                                    action={{
                                        id: "submit",
                                        buttonVariant: "primary",
                                        buttonText: "Next",
                                        buttonTestId: "btnSubmit",
                                        type: 'submit',
                                    }}
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
                        >
                            <>
                                The legal officers have been informed of your request.
                            </>
                        </Dialog>
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
