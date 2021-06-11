import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';

import PostalAddressType from './types/PostalAddress';

export interface Props {
    address: PostalAddressType
}

export default function PostalAddress(props: Props) {
    return (
        <>
            <FormGroup>
                <Form.Label>Line 1</Form.Label>
                <Form.Control type="text" value={ props.address.line1 } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>Line 2</Form.Label>
                <Form.Control type="text" value={ props.address.line2 } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>Postal code</Form.Label>
                <Form.Control type="text" value={ props.address.postalCode } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>City</Form.Label>
                <Form.Control type="text" value={ props.address.city } readOnly />
            </FormGroup>
            <FormGroup>
                <Form.Label>Country</Form.Label>
                <Form.Control type="text" value={ props.address.country } readOnly />
            </FormGroup>
        </>
    )
}
