import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';

import { Col } from '../common/Grid';
import Detail from "../common/Detail";

export interface ProtectionRequestDetailsProps {
    request : ProtectionRequest,
}

export default function ProtectionRequestDetails(props: ProtectionRequestDetailsProps) {

    return (
        <>
            <Col
                style={{width: "250px"}}
            >
                <Detail
                    label="Email"
                    value={ props.request.userIdentity.email }
                />
            </Col>
            <Col
                style={{width: "150px"}}
            >
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity.phoneNumber }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="Line 1"
                    value={ props.request.userPostalAddress.line1 }
                />
            </Col>
            <Col
                style={{width: "120px"}}
            >
                <Detail
                    label="Postal code"
                    value={ props.request.userPostalAddress.postalCode }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="City"
                    value={ props.request.userPostalAddress.city }
                />
            </Col>
            <Col
                style={{ flexGrow: 1 }}
            >
                <Detail
                    label="Country"
                    value={ props.request.userPostalAddress.country }
                />
            </Col>
        </>
    );
}
