import { CheckHashResult, CollectionItem } from "@logion/client";
import { Row } from "react-bootstrap";
import CertificateCell from "src/certificate/CertificateCell";
import CertificateDateTimeCell from "src/certificate/CertificateDateTimeCell";
import TermsAndConditions from "src/certificate/TermsAndConditions";

import "./CertificateItemDetails.css";

export interface Props {
    item: CollectionItem;
    checkResult?: CheckHashResult;
    hideNonRestrictedDelivery?: boolean;
}

export function CertificateItemDetails(props: Props) {
    const { id, description, addedOn, restrictedDelivery, token } = props.item;

    return (
        <>
        <Row>
            <CertificateDateTimeCell md={ 6 } label="Collection item timestamp:" dateTime={ addedOn } />
            <CertificateCell md={ 6 } label="Collection item identification:" matched={ props.checkResult?.collectionItem?.id === id } >
                { id }
            </CertificateCell>
        </Row>
        <Row>
            <CertificateCell md={ 12 } label="Collection item description:">
                <pre>{ description.validValue() }</pre>
            </CertificateCell>
        </Row>
        {
            (restrictedDelivery || !props.hideNonRestrictedDelivery) &&
            <Row>
                <CertificateCell md={ 12 } label="Restricted delivery:">
                    { restrictedDelivery ? "Yes": "No" }
                </CertificateCell>
            </Row>
        }
        {
            token !== undefined &&
            <Row>
                <CertificateCell md={ 4 } label="Underlying Token Type:">
                    { token.type.validValue() }
                </CertificateCell>
                <CertificateCell md={ 8 } label="Underlying Token ID:">
                    <pre>{ token.id.validValue() }</pre>
                </CertificateCell>
            </Row>
        }
        {
            token !== undefined &&
            <Row>
                <CertificateCell label="Underlying Token Issuance:">
                    <pre>{ token.issuance.toString() }</pre>
                </CertificateCell>
            </Row>
        }
        <Row>
            <TermsAndConditions item={ props.item } />
        </Row>
        </>
    );
}
