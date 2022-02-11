import { LegalOfficer } from "../directory/DirectoryApi";
import { LegalOfficerCase } from "../logion-chain/Types";
import CertificateCell from "./CertificateCell";
import { LegalOfficerPostalAddress } from "../common/LegalOfficerPostalAddress";
import LegalOfficerAdditionalDetails from "../common/LegalOfficerAdditionalDetails";
import { Row, Col } from "../common/Grid";

export default function LegalOfficerRow(props: { legalOfficer: LegalOfficer, loc: LegalOfficerCase }) {
    return (
        <Col className="legal-officer-row">
            <CertificateCell md={ 6 } label="Legal Officer (owner)">
                { props.loc.owner }
            </CertificateCell>
            <Row>
                <CertificateCell md={ 2 } label="">
                    { props.legalOfficer.name }
                </CertificateCell>
                <CertificateCell md={ 4 } label="Address">
                    <LegalOfficerPostalAddress address={ props.legalOfficer.postalAddress } />
                    <LegalOfficerAdditionalDetails additionalDetails={ props.legalOfficer.additionalDetails } />
                </CertificateCell>
            </Row>
        </Col>
    )
}
