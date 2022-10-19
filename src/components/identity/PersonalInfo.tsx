import { Row } from "../../common/Grid";
import { Col } from "react-bootstrap";
import Detail from "../../common/Detail";
import { PersonalInfoProps } from "./type";
import { LocRequestStatus } from "@logion/client/dist/LocClient";

import "./PersonalInfo.css";
import LegalEntity from "./LegalEntity";

interface PersonalAndStatusInfoProps extends PersonalInfoProps {
    status: LocRequestStatus,
    seal?: string
}

export function PersonalInfo(props: { personalAndStatusInfo: PersonalAndStatusInfoProps }) {
    const { requesterAddress, userIdentity, userPostalAddress, status, seal, company } = props.personalAndStatusInfo;
    const padding = "/";
    return (
        <div className="PersonalInfo">
            <p className="title">Submitted Identity Data</p>
            <Row>
                <Col>
                    <LegalEntity
                        company={ company }
                    />
                </Col>
            </Row>
            <Row>
                <Col md={ 6 }>
                    <Row>
                        <Detail label="Account Address" value={ requesterAddress || padding } />
                    </Row>
                    <Row>
                        <Col style={ { flexGrow: 1 } }>
                            <Detail label="First Name" value={ userIdentity?.firstName || padding } />
                            <Detail label="Email" value={ userIdentity?.email || padding } />
                        </Col>
                        <Col style={ { flexGrow: 1 } }>
                            <Detail label="Last Name" value={ userIdentity?.lastName || padding } />
                            <Detail label="Phone Number" value={ userIdentity?.phoneNumber || padding } />
                        </Col>
                    </Row>
                </Col>
                <Col md={ 6 }>
                    <Detail label="Line1" value={ userPostalAddress?.line1 || padding } />
                    <Detail label="Line2" value={ userPostalAddress?.line2 || padding } />

                    <Row>
                        <Col style={ { flexGrow: 1 } }>
                            <Detail label="Postal Code" value={ userPostalAddress?.postalCode || padding } />
                        </Col>
                        <Col style={ { flexGrow: 2 } }>
                            <Detail label="City" value={ userPostalAddress?.city || padding } />
                        </Col>
                    </Row>
                    <Row>
                        <Col style={ { flexGrow: 1 } }>
                            <Detail label="Country" value={ userPostalAddress?.country || padding } />
                        </Col>
                    </Row>
                </Col>
            </Row>
            {
                status === "CLOSED" &&
                <Row>
                    <Col>
                        <p className="title">Related identity records existence proof</p>
                        <p>{ seal || "" }</p>
                    </Col>
                </Row>
            }
        </div>
    )
}
