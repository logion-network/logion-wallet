import { useCallback, useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { LegalOfficer } from "@logion/client";

import Button from "../common/Button";
import { GREEN, ORANGE, RED } from "../common/ColorTheme";
import { useCommonContext } from "../common/CommonContext";
import FormGroup from "../common/FormGroup";
import { useLogionChain } from "../logion-chain";
import { useLegalOfficerContext } from "src/legal-officer/LegalOfficerContext";

type SaveStatus = 'SUCCESS' | 'ERROR' | 'NONE' | 'INVALID';

interface FormValues {
    address: string;
    additionalDetails: string;
    logoUrl: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company: string;
    line1: string;
    line2: string;
    postalCode: string;
    city: string;
    country: string;
}

export default function DirectoryData() {
    const { accounts, getOfficer, saveOfficer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const [ formInitialized, setFormInitialized ] = useState(false);
    const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>();
    const [ saveStatus, setSaveStatus ] = useState<SaveStatus>();
    const { refreshRequests } = useLegalOfficerContext();

    useEffect(() => {
        if(getOfficer && !formInitialized) {
            const legalOfficerFromDirectory = getOfficer(accounts?.current?.address);
            if(legalOfficerFromDirectory) {
                setValue("address", legalOfficerFromDirectory.address);
                setValue("logoUrl", legalOfficerFromDirectory.logoUrl);
                setValue("additionalDetails", legalOfficerFromDirectory.additionalDetails);

                setValue("firstName", legalOfficerFromDirectory.userIdentity.firstName);
                setValue("lastName", legalOfficerFromDirectory.userIdentity.lastName);
                setValue("email", legalOfficerFromDirectory.userIdentity.email);
                setValue("phoneNumber", legalOfficerFromDirectory.userIdentity.phoneNumber);

                setValue("company", legalOfficerFromDirectory.postalAddress.company);
                setValue("line1", legalOfficerFromDirectory.postalAddress.line1);
                setValue("line2", legalOfficerFromDirectory.postalAddress.line2);
                setValue("postalCode", legalOfficerFromDirectory.postalAddress.postalCode);
                setValue("city", legalOfficerFromDirectory.postalAddress.city);
                setValue("country", legalOfficerFromDirectory.postalAddress.country);
            }
            setFormInitialized(true);
        }
    }, [ accounts, formInitialized ]);

    const save = useCallback(async (formValues: FormValues) => {
        setSaveStatus('NONE');
        if(saveOfficer) {
            try {
                await saveOfficer(toLegalOfficer(formValues));
                setSaveStatus('SUCCESS');
                refreshRequests(false);
            } catch(e) {
                console.log(e);
                setSaveStatus('ERROR');
            }
        } else {
            setSaveStatus('ERROR');
        }
    }, [ saveOfficer, setSaveStatus ]);

    if(!accounts || !accounts.current || !accounts.current.isLegalOfficer || getOfficer === undefined || saveOfficer === undefined) {
        return null;
    }

    return (
        <div className="DirectoryData">
            <Form onSubmit={ handleSubmit(save, () => setSaveStatus("INVALID")) }>
                <Row>
                    <Col md={6}>
                        <FormGroup
                            id="firstName"
                            label="First name"
                            control={
                                <Controller
                                    name="firstName"
                                    control={ control }
                                    rules={{
                                        required: 'First name is required',
                                    }}
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.firstName?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
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
                            label="Last name"
                            control={
                                <Controller
                                    name="lastName"
                                    control={ control }
                                    rules={{
                                        required: 'Last name is required',
                                    }}
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.lastName?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
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
                            label="E-mail"
                            control={
                                <Controller
                                    name="email"
                                    control={ control }
                                    rules={{
                                        required: 'E-mail is required',
                                    }}
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.email?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
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
                            id="phone"
                            label="Phone number"
                            control={
                                <Controller
                                    name="phoneNumber"
                                    control={ control }
                                    rules={{
                                        required: 'Phone number is required',
                                    }}
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.phoneNumber?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.phoneNumber?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup
                            id="company"
                            label="Company"
                            control={
                                <Controller
                                    name="company"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.company?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.company?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup
                            id="line1"
                            label="Line 1"
                            control={
                                <Controller
                                    name="line1"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.line1?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.line1?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup
                            id="line2"
                            label="Line 2"
                            control={
                                <Controller
                                    name="line2"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.line2?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.line2?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <FormGroup
                            id="postalCode"
                            label="Postal code"
                            control={
                                <Controller
                                    name="postalCode"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.postalCode?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.postalCode?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                    <Col md={6}>
                        <FormGroup
                            id="city"
                            label="City"
                            control={
                                <Controller
                                    name="city"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.city?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.city?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup
                            id="country"
                            label="Country"
                            control={
                                <Controller
                                    name="country"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.country?.message }
                                            type="text"
                                            placeholder=""
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.country?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup
                            id="additionalDetails"
                            label="Additional details"
                            control={
                                <Controller
                                    name="additionalDetails"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Form.Control
                                            isInvalid={ !!errors.additionalDetails?.message }
                                            type="text"
                                            as="textarea"
                                            style={{ height: '100px' }}
                                            value={ field.value }
                                            onChange={ field.onChange }
                                        />
                                    )}
                                />
                            }
                            feedback={ errors.additionalDetails?.message }
                            colors={ colorTheme.frame }
                        />
                    </Col>
                </Row>
                <Button type="submit">
                    Save changes
                </Button>
            </Form>
            { saveStatus === "INVALID" && <span style={{ color: ORANGE, fontWeight: "bold"}}>Invalid data, please check form</span> }
            { saveStatus === "SUCCESS" && <span style={{ color: GREEN, fontWeight: "bold"}}>Data were saved successfully</span> }
            { saveStatus === "ERROR" && <span style={{ color: RED, fontWeight: "bold"}}>Data were not saved successfully</span> }
        </div>
    );
}

function toLegalOfficer(formValues: FormValues): LegalOfficer {
    return {
        address: formValues.address,
        additionalDetails: formValues.additionalDetails,
        logoUrl: formValues.logoUrl,
        name: "",
        node: "",
        postalAddress: {
            company: formValues.company,
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
            phoneNumber: formValues.phoneNumber,
        }
    }
}
