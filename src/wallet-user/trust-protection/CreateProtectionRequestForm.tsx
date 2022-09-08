import { useState, useEffect } from 'react';
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useForm } from 'react-hook-form';
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
import IdentityForm from "../../components/identity/IdentityForm";

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
    const [ agree, setAgree ] = useState<boolean>(false);

    const submit = async (formValues: FormValues) => {
        if(legalOfficer1 === null || legalOfficer2 === null
            || !agree
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
                            label={ props.isRecovery ? "Select Legal Officer N°" : "Choose Legal Officer N°" }
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

                        <Form onSubmit={ handleSubmit(submit) }>
                            <IdentityForm
                                control={ control }
                                errors={ errors }
                                colors={ colorTheme.frame }
                            />

                            <div className="agree-submit">
                                <Form.Check
                                    data-testid="agree"
                                    type="checkbox"
                                    checked={ agree }
                                    onChange={ () => {
                                        setAgree(!agree);
                                        setCall(undefined)
                                    } }
                                    label="I agree to send my personal information to the chosen Legal Officers"
                                />
                                <ClientExtrinsicSubmitter
                                    successMessage="Recovery successfully initiated."
                                    call={ call }
                                    onSuccess={ () => setRequestCreated(true) }
                                    onError={ () => setAgree(false) }
                                />

                                <Button
                                    action={{
                                        id: "submit",
                                        buttonVariant: "primary",
                                        buttonText: "Next",
                                        buttonTestId: "btnSubmit",
                                        type: 'submit',
                                        disabled: !agree,
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
