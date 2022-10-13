import React, { useCallback, useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { LegalOfficer, LegalOfficerPostalAddress, UserIdentity } from "@logion/client";

import Button from "../common/Button";
import { GREEN, RED } from "../common/ColorTheme";
import { useCommonContext } from "../common/CommonContext";
import FormGroup from "../common/FormGroup";
import { useLogionChain } from "../logion-chain";

type SaveStatus = 'SUCCESS' | 'ERROR' | 'NONE';

export default function DirectoryData() {
    const { accounts, getOfficer, saveOfficer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer>({
        name: "",
        address: "",
        additionalDetails: "",
        logoUrl: "",
        node: "",
        userIdentity: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
        },
        postalAddress: {
            company: "",
            line1: "",
            line2: "",
            postalCode: "",
            city: "",
            country: "",
        },
    });
    const [ saveStatus, setSaveStatus ] = useState<SaveStatus>();

    useEffect(() => {
        if(getOfficer && (!legalOfficer || legalOfficer.address !== accounts?.current?.address)) {
            const legalOfficerFromDirectory = getOfficer(accounts?.current?.address);
            if(legalOfficerFromDirectory) {
                setLegalOfficer(legalOfficerFromDirectory);
            }
        }
    }, [ accounts, legalOfficer, getOfficer ]);

    const save = useCallback(async () => {
        setSaveStatus('NONE');
        if(saveOfficer) {
            try {
                await saveOfficer(legalOfficer);
                setSaveStatus('SUCCESS');
            } catch(e) {
                console.log(e);
                setSaveStatus('ERROR');
            }
        } else {
            setSaveStatus('ERROR');
        }
    }, [ saveOfficer, legalOfficer, setSaveStatus ]);

    if(!accounts || !accounts.current || !accounts.current.isLegalOfficer || getOfficer === undefined || saveOfficer === undefined) {
        return null;
    }

    return (
        <div className="DirectoryData">
            <Row>
                <Col md={6}>
                    <FormGroup
                        id="firstName"
                        label="First name"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.userIdentity.firstName }
                            onChange={ event => setUserIdentityField('firstName', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
                <Col md={6}>
                    <FormGroup
                        id="lastName"
                        label="Last name"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.userIdentity.lastName }
                            onChange={ event => setUserIdentityField('lastName', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <FormGroup
                        id="email"
                        label="E-mail"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.userIdentity.email }
                            onChange={ event => setUserIdentityField('email', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
                <Col md={6}>
                    <FormGroup
                        id="phone"
                        label="Phone number"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.userIdentity.phoneNumber }
                            onChange={ event => setUserIdentityField('phoneNumber', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="company"
                        label="Company"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.company }
                            onChange={ event => setPostalAddressField('company', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="line1"
                        label="Line 1"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.line1 }
                            onChange={ event => setPostalAddressField('line1', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="line2"
                        label="Line 2"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.line2 }
                            onChange={ event => setPostalAddressField('line2', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <FormGroup
                        id="postalCode"
                        label="Postal code"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.postalCode }
                            onChange={ event => setPostalAddressField('postalCode', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
                <Col md={6}>
                    <FormGroup
                        id="city"
                        label="City"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.city }
                            onChange={ event => setPostalAddressField('city', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="country"
                        label="Country"
                        control={ <Form.Control
                            type="text"
                            value={ legalOfficer.postalAddress.country }
                            onChange={ event => setPostalAddressField('country', event) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="additionalDetails"
                        label="Additional details"
                        control={ <Form.Control
                            type="text"
                            as="textarea"
                            style={{ height: '100px' }}
                            value={ legalOfficer.additionalDetails }
                            onChange={ event => setLegalOfficer({
                                ...legalOfficer,
                                additionalDetails: event.target.value
                            }) }
                        /> }
                        colors={ colorTheme.frame }
                    />
                </Col>
            </Row>
            <Button onClick={ save }>
                Save changes
            </Button>
            { saveStatus === "SUCCESS" && <span style={{marginLeft: "20px", color: GREEN, fontWeight: "bold"}}>Data were saved successfully</span> }
            { saveStatus === "ERROR" && <span style={{marginLeft: "20px", color: RED, fontWeight: "bold"}}>Data were not saved successfully</span> }
        </div>
    );

    function setUserIdentityField(fieldName: keyof UserIdentity, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newLegalOfficerValue = { ...legalOfficer! };
        if(!newLegalOfficerValue.userIdentity) {
            newLegalOfficerValue.userIdentity = {
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
            };
        }
        newLegalOfficerValue.userIdentity[fieldName] = event.target.value;
        setLegalOfficer(newLegalOfficerValue);
    }

    function setPostalAddressField(fieldName: keyof LegalOfficerPostalAddress, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newLegalOfficerValue = { ...legalOfficer! };
        if(!newLegalOfficerValue.postalAddress) {
            newLegalOfficerValue.postalAddress = {
                company: "",
                line1: "",
                line2: "",
                postalCode: "",
                city: "",
                country: "",
            };
        }
        newLegalOfficerValue.postalAddress[fieldName] = event.target.value;
        setLegalOfficer(newLegalOfficerValue);
    }
}
