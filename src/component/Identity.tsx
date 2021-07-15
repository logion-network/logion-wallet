import React from 'react';
import IdentityType from './types/Identity';
import { Row, Col } from "react-bootstrap";
import { BackgroundAndForegroundColors } from "./ColorTheme";
import ComparableField from "./ComparableField";
import "./Identity.css";

export interface Props {
    identity: IdentityType
    otherIdentity?: IdentityType
    colors: BackgroundAndForegroundColors
}

export default function Identity(props: Props) {

    interface FieldProps {
        id: string
        label: string
        field: (identity: IdentityType) => string
    }

    function ComparableIdentityField(fieldProps: FieldProps) {
        return (
            <ComparableField
                id={ fieldProps.id }
                label={ fieldProps.label }
                data={ props.identity }
                otherData={ props.otherIdentity }
                field={ fieldProps.field }
                colors={ props.colors } />
        );
    }

    return (
        <div className="Identity">
            <Row>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="firstName"
                        label="First Name"
                        field={ identity => identity.firstName }
                    />
                </Col>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="lastName"
                        label="Last Name"
                        field={ identity => identity.lastName }
                    />
                </Col>
            </Row>
            <Row>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="email"
                        label="Email"
                        field={ identity => identity.email }
                    />
                </Col>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="phoneNumber"
                        label="Phone Number"
                        field={ identity => identity.phoneNumber }
                    />
                </Col>
            </Row>
        </div>
    );
}
