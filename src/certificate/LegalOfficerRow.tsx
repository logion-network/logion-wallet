import { LegalOfficer } from "@logion/client";
import { Row, Col } from "react-bootstrap";

import CertificateCell from "./CertificateCell";
import { LegalOfficerContactInfo } from "../common/LegalOfficerContactInfo";
import { LegalOfficerPostalAddressInfo } from "../common/LegalOfficerPostalAddressInfo";
import LegalOfficerAdditionalDetails from "../common/LegalOfficerAdditionalDetails";
import MailtoButton from "src/common/MailtoButton";
import Button from "src/common/Button";
import { copyToClipBoard } from "src/common/Tools";

export default function LegalOfficerRow(props: { legalOfficer: LegalOfficer }) {
    return (
        <>
        <Row className="legal-officer-row">
            <div>
                <CertificateCell md={ 6 } label="Legal Officer (owner)">
                    { props.legalOfficer.account.address }
                </CertificateCell>
            </div>
        </Row>
        <Row>
            <CertificateCell md={ 2 } label="">
                <LegalOfficerContactInfo identity={ props.legalOfficer.userIdentity } showName={ true } />
            </CertificateCell>
            <CertificateCell md={ 4 } label="Address">
                <LegalOfficerPostalAddressInfo address={ props.legalOfficer.postalAddress } />
                <LegalOfficerAdditionalDetails additionalDetails={ props.legalOfficer.additionalDetails } />
            </CertificateCell>
        </Row>
        <Row className="buttons">
            <Col xl={ 2 } lg={4} md={4}>
                <MailtoButton label="Contact" email={ props.legalOfficer.userIdentity.email } />
            </Col>
            <Col xl={ 2 } lg={4} md={4}>
                <Button onClick={ () => copyToClipBoard(window.location.href) }>Copy URL</Button>
            </Col>
            <Col xl={ 2 } lg={4} md={4}>
                <a href="https://logion.network" target="_blank" rel="noreferrer">logion.network</a>
            </Col>
        </Row>
        </>
    )
}
