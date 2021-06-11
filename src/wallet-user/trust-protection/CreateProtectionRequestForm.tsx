import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import {CreateProtectionRequest, legalOfficers} from "./Model";
import {useUserContext} from "../UserContext";
import moment from "moment";
import {sign} from "../../logion-chain";
import {Row, Col} from "react-bootstrap";
import {Link} from "react-router-dom";
import {USER_PATH} from "../../RootPaths";

export default function CreateProtectionRequestForm() {

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
        legalOfficers: string[]
    }

    const {control, handleSubmit, formState: {errors}} = useForm<FormValues>();
    const {userAddress, createProtectionRequest} = useUserContext();

    const submit = async (formValues: FormValues) => {

        formValues.legalOfficers = [legalOfficers[0].address, legalOfficers[1].address];

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
        ].concat(formValues.legalOfficers);

        const signedOn = moment();
        const signature = await sign({
            signerId: userAddress,
            resource: 'protection-request',
            operation: 'create',
            signedOn,
            attributes,
        });
        const request: CreateProtectionRequest = {
            requesterAddress: userAddress,
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
            legalOfficerAddresses: formValues.legalOfficers,
            signature,
            signedOn,
        }
        await createProtectionRequest!(request);
    }
    return (
        <>
            <h1>No protection detected</h1>
            <Form onSubmit={handleSubmit(submit)}>
                <p>If you aim to start a Recovery process to that account, you have to select at least one of the Legal
                    Officer already in charge of the account to be recovered</p>
                <ButtonGroup toggle vertical={true}>
                    {legalOfficers.map((legalOfficer, index) => (
                        <Form.Group as={Row} key={'legalOfficer' + index} controlId={'legalOfficer' + index}>
                            <Form.Check type="checkbox" value={legalOfficer.address}/>
                            <Form.Label>{legalOfficer.name} ({legalOfficer.address})</Form.Label>
                        </Form.Group>
                    ))}
                </ButtonGroup>
                <h3>Identity</h3>
                <Form.Group as={Row} controlId="firstName">
                    <Form.Label column sm={3}>First Name</Form.Label>
                    <Col sm={9}>
                        <Controller name="firstName"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The first name is required'}}
                                    render={({field}) => <Form.Control isInvalid={!!errors.firstName?.message}
                                                                       type="text" placeholder="e.g. XYZ"
                                                                       data-testid="firstName" {...field} />}
                        />
                        <Form.Control.Feedback type="invalid"
                                               data-testid="firstNameMessage">{errors.firstName?.message}</Form.Control.Feedback>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="lastName">
                    <Form.Label column sm={3}>Last Name</Form.Label>
                    <Col sm={9}>
                        <Controller name="lastName"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The last name is required'}}
                                    render={({field}) => <Form.Control isInvalid={!!errors.lastName?.message}
                                                                       type="text" placeholder="e.g. XYZ"
                                                                       data-testid="lastName" {...field} />}
                        />
                        <Form.Control.Feedback type="invalid"
                                               data-testid="lastNameMessage">{errors.lastName?.message}</Form.Control.Feedback>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="email">
                    <Form.Label column sm={3}>Email</Form.Label>
                    <Col sm={9}>
                        <Controller name="email"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The email is required'}}
                                    render={({field}) => <Form.Control isInvalid={!!errors.email?.message}
                                                                       type="text" placeholder="e.g. XYZ"
                                                                       data-testid="email" {...field} />}
                        />
                        <Form.Control.Feedback type="invalid"
                                               data-testid="emailMessage">{errors.email?.message}</Form.Control.Feedback>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="phoneNumber">
                    <Form.Label column sm={3}>Phone Number</Form.Label>
                    <Col sm={9}>
                        <Controller name="phoneNumber"
                                    control={control}
                                    defaultValue=""
                                    rules={{required: 'The phone number is required'}}
                                    render={({field}) => <Form.Control isInvalid={!!errors.phoneNumber?.message}
                                                                       type="text" placeholder="e.g. XYZ"
                                                                       data-testid="phoneNumber" {...field} />}
                        />
                        <Form.Control.Feedback type="invalid"
                                               data-testid="phoneNumberMessage">{errors.phoneNumber?.message}</Form.Control.Feedback>
                    </Col>
                </Form.Group>
                <h3>Address</h3>
                <Form.Group as={Row} controlId="line1">
                    <Form.Label column sm={3}>Line1</Form.Label>
                    <Col sm={9}>
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
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="line2">
                    <Form.Label column sm={3}>Line2</Form.Label>
                    <Col sm={9}>
                        <Controller name="line2"
                                    control={control}
                                    defaultValue=""
                                    render={({field}) => <Form.Control isInvalid={!!errors.line2?.message}
                                                                       type="text" placeholder="e.g. XYZ"
                                                                       data-testid="line2" {...field} />}
                        />
                        <Form.Control.Feedback type="invalid"
                                               data-testid="line2Message">{errors.line2?.message}</Form.Control.Feedback>
                    </Col>
                </Form.Group>
    
                <Form.Group as={Row} controlId="postalCode">
                    <Form.Label column sm={3}>Postal Code</Form.Label>
                    <Col sm={9}>
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
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="city">
                    <Form.Label column sm={3}>City</Form.Label>
                    <Col sm={9}>
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
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="country">
                    <Form.Label column sm={3}>Country</Form.Label>
                    <Col sm={9}>
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
                    </Col>
                </Form.Group>
    
                <p>Do you agree to send your first name, last name, email, phone number and address to the following Legal
                    Officers ?</p>
                <p>This initial personal information sharing will start KYC process and will also be used in this context of
                    a potential future Account recovery process</p>
                <ButtonGroup>
                    <Button type="submit" variant="primary" data-testid="btnSubmit">I agree and submit my request</Button>
                    <Link to={USER_PATH}>
                        <Button variant="secondary" data-testid="btnCancel">Cancel</Button>
                    </Link>
                </ButtonGroup>
            </Form>
        </>
    );
}
