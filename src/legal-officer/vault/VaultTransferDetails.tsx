import { Row, Col } from 'react-bootstrap';
import Detail from "../../common/Detail";
import { VaultTransferRequest } from "../../vault/VaultApi";
import AddressFormat from '../../common/AddressFormat';

export interface Props {
    request : VaultTransferRequest;
}

export default function VaultTransferRequestDetails(props: Props) {

    return (
        <>
            <Row>
                <Col md={ 2 }>
                    <Detail
                        label="Polkadot Address"
                        value={ <AddressFormat address={ props.request.requesterAddress } /> }
                    />
                </Col>
                <Col>
                    <Detail
                        label="Postal Address"
                        value={ props.request.requesterPostalAddress.line1 || "" }
                    />
                </Col>
                <Col>
                    <Detail
                        label="City"
                        value={ props.request.requesterPostalAddress.city || "" }
                    />
                </Col>
                <Col>
                    <Detail
                        label="Country"
                        value={ props.request.requesterPostalAddress.country || "" }
                    />
                </Col>
                <Col>
                    <Detail
                        label="E-mail"
                        value={ props.request.requesterIdentity.email || "" }
                    />
                </Col>
                <Col>
                    <Detail
                        label="Phone number"
                        value={ props.request.requesterIdentity.phoneNumber || "" }
                    />
                </Col>
                {
                    (props.request.status === "REJECTED" || props.request.status === "REJECTED_CANCELLED") &&
                    <Col md={ 12 }>
                        <Detail
                            label="Reason"
                            value={ props.request.decision?.rejectReason || "-" }
                        />
                    </Col>
                }
            </Row>
        </>
    );
}
