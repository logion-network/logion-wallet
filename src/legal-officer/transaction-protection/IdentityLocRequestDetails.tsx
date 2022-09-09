import { Col, Row } from '../../common/Grid';
import Detail from "../../common/Detail";
import { LocRequestDetailsProps } from "./LocRequestDetails";

export default function IdentityLocRequestDetails(props: LocRequestDetailsProps) {

    const userIdentity = props.request.userIdentity || {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    }
    const userPostalAddress = props.request.userPostalAddress || {
        line1: "",
        line2: "",
        postalCode: "",
        city: "",
        country: "",
    }
    return (
        <>
            <Col
                style={ { flexGrow: 1 } }
            >
                <Detail
                    label="Account Address"
                    value={ props.request.requesterAddress || "" }
                />
                <Row>
                    <Col style={ { flexGrow: 1 } }>
                        <Detail
                            label="First Name"
                            value={ userIdentity.firstName }
                        />
                        <Detail
                            label="E-mail"
                            value={ userIdentity.email }
                        />
                    </Col>
                    <Col style={ { flexGrow: 1 } }>
                        <Detail
                            label="Last Name"
                            value={ userIdentity.lastName }
                        />
                        <Detail
                            label="Phone number"
                            value={ userIdentity.phoneNumber }
                        />
                    </Col>
                </Row>
            </Col>

            <Col
                style={ { flexGrow: 1 } }
            >
                <Detail
                    label="Line1"
                    value={ userPostalAddress.line1 }
                />
                <Detail
                    label="Line2"
                    value={ userPostalAddress.line2 }
                />
                <Row>
                    <Detail
                        label="Postal Code"
                        value={ userPostalAddress.postalCode }
                    />
                    <Detail
                        label="City"
                        value={ userPostalAddress.city }
                    />
                </Row>
                <Detail
                    label="Country"
                    value={ userPostalAddress.country }
                />
            </Col>
        </>
    );
}
