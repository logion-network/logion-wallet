import React from "react";

import { Col } from '../common/Grid';
import Detail from "../common/Detail";

import { ProtectionRequest } from "../common/types/ModelTypes";
import { getOfficer } from "../common/types/LegalOfficer";

export interface Props {
    request : ProtectionRequest,
}

export default function ProtectedUserDetails(props: Props) {

    const legalOfficer = getOfficer(props.request.otherLegalOfficerAddress);

    let userAddress;
    if(props.request.userPostalAddress.line2 === null || props.request.userPostalAddress.line2 === "") {
        userAddress = <span>{ props.request.userPostalAddress.line1 }</span>
    } else {
        userAddress = <span>{ props.request.userPostalAddress.line1 }<br/>{ props.request.userPostalAddress.line2 }</span>
    }

    return (
        <>
            <Col
                style={{width: "25%"}}
            >
                <Detail
                    label="Polkadot Address"
                    value={ props.request.requesterAddress }
                />
                <Detail
                    label="Email"
                    value={ props.request.userIdentity.email }
                />
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity.phoneNumber }
                />
            </Col>
            <Col
                style={{width: "25%"}}
            >
                <Detail
                    label="Postal Address"
                    value={ userAddress }
                />
                <Detail
                    label="City"
                    value={ props.request.userPostalAddress.postalCode + " " + props.request.userPostalAddress.city }
                />
                <Detail
                    label="Country"
                    value={ props.request.userPostalAddress.country }
                />
            </Col>
            <Col
                style={{width: "50%"}}
            >
                <Detail
                    label="Polkadot Address"
                    value={ props.request.otherLegalOfficerAddress }
                />
                <Detail
                    label="Details"
                    value={ legalOfficer!.details.split(/\n/).map((line, index) => (
                        <span key={ index } >{line}<br/></span>
                    ))}
                />
            </Col>
        </>
    );
}
