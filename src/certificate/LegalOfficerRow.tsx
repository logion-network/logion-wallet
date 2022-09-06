import { LegalOfficer } from "@logion/client";

import CertificateCell from "./CertificateCell";
import { LegalOfficerContactInfo } from "../common/LegalOfficerContactInfo";
import { LegalOfficerPostalAddress } from "../common/LegalOfficerPostalAddress";
import LegalOfficerAdditionalDetails from "../common/LegalOfficerAdditionalDetails";
import { Row, Col } from "../common/Grid";

export default function LegalOfficerRow(props: { legalOfficer: LegalOfficer }) {
    return (
        <Col className="legal-officer-row">
            <CertificateCell md={ 6 } label="Legal Officer (owner)">
                { props.legalOfficer.address }
            </CertificateCell>
            <Row>
                <CertificateCell md={ 2 } label="">
                    <LegalOfficerContactInfo identity={ props.legalOfficer.userIdentity } showName={ true } />
                </CertificateCell>
                <CertificateCell md={ 4 } label="Address">
                    <LegalOfficerPostalAddress address={ props.legalOfficer.postalAddress } />
                    <LegalOfficerAdditionalDetails additionalDetails={ props.legalOfficer.additionalDetails } />
                </CertificateCell>
            </Row>
        </Col>
    )
}
