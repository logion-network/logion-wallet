import React from "react";
import Col from 'react-bootstrap/Col';

import Detail from "../component/Detail";

import { ProtectionRequest } from "./Types";
import { useLegalOfficerContext } from "./LegalOfficerContext";

export interface ProtectionRequestDetailsProps {
    request : ProtectionRequest,
}

export default function ProtectionRequestDetails(props: ProtectionRequestDetailsProps) {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <>
            <Col md={ 4 }>
                <Detail
                    label="Email"
                    value={ props.request.userIdentity.email }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col md={ 1 }>
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity.phoneNumber }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col md={ 2 }>
                <Detail
                    label="Line 1"
                    value={ props.request.userPostalAddress.line1 }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col md={ 1 }>
                <Detail
                    label="Postal code"
                    value={ props.request.userPostalAddress.postalCode }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col md={ 2 }>
                <Detail
                    label="City"
                    value={ props.request.userPostalAddress.city }
                    colorTheme={ colorTheme }
                />
            </Col>
            <Col md={ 2 }>
                <Detail
                    label="Country"
                    value={ props.request.userPostalAddress.country }
                    colorTheme={ colorTheme }
                />
            </Col>
        </>
    );
}
