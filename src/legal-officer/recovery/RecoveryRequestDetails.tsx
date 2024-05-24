import { Col, Container, Row } from "react-bootstrap";
import Detail from "../../common/Detail";
import { RecoveryRequest } from "@logion/client";

export interface ProtectionRequestDetailsProps {
    request : RecoveryRequest,
}

export default function RecoveryRequestDetails(props: ProtectionRequestDetailsProps) {

    return (
        <Container fluid>
            <Row>
                <Col md={3}>
                    <Detail
                        label="Email"
                        value={ props.request.data.userIdentity.email }
                    />
                </Col>
                <Col md={3}>
                    <Detail
                        label="Phone number"
                        value={ props.request.data.userIdentity.phoneNumber }
                    />
                </Col>
                {
                    props.request.data.status === "REJECTED" &&
                    <Col>
                        <Detail
                            label="Reject reason"
                            value={ props.request.data.rejectReason || "-" }
                        />
                    </Col>
                }
            </Row>
        </Container>
    );
}
