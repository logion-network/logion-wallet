import { CollectionItem } from "@logion/client";

import CertificateCell from "./CertificateCell";
import LogionClassification from "./LogionClassification";
import SpecificLicenses from "./SpecificLicenses";
import CertificateLabel from "./CertificateLabel";
import CreativeCommons from "./CreativeCommons";
import "./TermsAndConditions.css";

export interface Props {
    item: CollectionItem;
}

export default function TermsAndConditions(props: Props) {
    const { item } = props;

    return (
        <CertificateCell md={ 12 } label="Terms and conditions">
            <div className="TermsAndConditions">
                { !item.logionClassification && !item.creativeCommons && <None/> }
                { item.logionClassification && <LogionClassification logionClassification={ item.logionClassification } /> }
                { item.creativeCommons && <CreativeCommons creativeCommons={ item.creativeCommons } /> }
                <SpecificLicenses item={ item } />
            </div>
        </CertificateCell>
    );
}

function None() {
    return (
        <div className="None">
            <CertificateLabel smaller={ true }>IP rights granted with this Collection Item</CertificateLabel>
            <p>None</p>
        </div>
    )
}
