import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';

import IdentityType from './types/Identity';

export interface Props {
    identity: IdentityType
}

export default function Identity(props: Props) {
    return (
        <>
            <FormGroup>
                <Form.Label>First name</Form.Label>
                <Form.Control type="text" value={ props.identity.firstName } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>Last name</Form.Label>
                <Form.Control type="text" value={ props.identity.lastName } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>E-mail</Form.Label>
                <Form.Control type="text" value={ props.identity.email } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>Phone number</Form.Label>
                <Form.Control type="text" value={ props.identity.phoneNumber } readOnly />
            </FormGroup>
        </>
    );
}
