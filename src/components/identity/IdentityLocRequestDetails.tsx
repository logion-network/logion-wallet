import { Col, Row } from "../../common/Grid";
import Detail from "../../common/Detail";
import { PersonalInfoProps } from "./type";
import LegalEntity from "./LegalEntity";

import "./IdentityLocRequestDetails.css";

export default function IdentityLocRequestDetails(props: { personalInfo: PersonalInfoProps }) {

    const userIdentity = props.personalInfo.userIdentity || {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    }
    const userPostalAddress = props.personalInfo.userPostalAddress || {
        line1: "",
        line2: "",
        postalCode: "",
        city: "",
        country: "",
    }
    return (
        <>
            <Col
                className="IdentityLocRequestDetails"
                style={ { flexGrow: 1 } }
            >
                <p className="title">Submitted Identity Data</p>
                <Row>
                    <LegalEntity
                        company={ props.personalInfo.company }
                    />
                </Row>
                <Row>
                    <Col
                        style={ { flexGrow: 1 } }
                    >
                        <Row>
                            
                        </Row>
                        <Row>
                            <Detail
                                label="Account Address"
                                value={ props.personalInfo.requesterAddress || "" }
                            />
                        </Row>
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
                </Row>
            </Col>
        </>
    );
}
