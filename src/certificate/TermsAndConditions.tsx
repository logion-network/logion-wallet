import { CollectionItem } from "@logion/client";

import CertificateCell from "./CertificateCell";
import LogionClassification from "./LogionClassification";
import SpecificLicenses from "./SpecificLicenses";

import "./TermsAndConditions.css";

export interface Props {
    item: CollectionItem;
}

export default function TermsAndConditions(props: Props) {
    const { item } = props;

    return (
        <CertificateCell md={ 12 } label="Terms and conditions">
            <div className="TermsAndConditions">
                <LogionClassification item={ item } />
                <SpecificLicenses item={ item } />
            </div>
        </CertificateCell>
    );
}
