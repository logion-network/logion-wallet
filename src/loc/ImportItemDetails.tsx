import {
    ItemFileWithContent,
    ItemTokenWithRestrictedType,
    SpecificLicense,
    LogionClassification,
    TermsAndConditionsElement,
    CreativeCommons,
} from "@logion/client";
import './ImportItemDetails.css';

export type ErrorType = 'validation' | 'chain' | 'upload';

export interface Item {
    id: string;
    description: string;
    files: ItemFileWithContent[];
    restrictedDelivery: boolean;
    token?: ItemTokenWithRestrictedType;
    error?: string;
    errorType?: ErrorType;
    submitted: boolean;
    failed: boolean;
    success: boolean;
    upload: boolean;
    logionClassification?: LogionClassification,
    specificLicense?: SpecificLicense,
    creativeCommons?: CreativeCommons,
}

function termsAncConditions(tc: TermsAndConditionsElement, locLabel: string) {
    return (
        <ul>
            <li>Type : { tc.type }</li>
            { tc.details.length > 0 && <li>Parameters : { tc.details }</li> }
            <li>{ locLabel }: { tc.tcLocId.toDecimalString() }</li>
        </ul>
    )
}

export default function ImportItemDetails(props: { item: Item }) {
    return (
        <div className="ImportItemDetails">
            {
                props.item.error &&
                <p className="error-message">{ props.item.error }</p>
            }
            <div className="item-description">
                <p>Item description:</p>
                <pre>{ props.item.description }</pre>
                {
                    props.item.files.length > 0 &&
                    <div className="item-file">
                        <p>Attached file:</p>
                        <ul>
                            <li>Name: { props.item.files[0].name }</li>
                            <li>Content type: { props.item.files[0].contentType.mimeType }</li>
                            <li>Hash: { props.item.files[0].hashOrContent.contentHash }</li>
                            <li>Size: { props.item.files[0].size.toString() } bytes</li>
                        </ul>
                    </div>
                }
            </div>
            <p className="item-delivery">Restricted delivery: { props.item.restrictedDelivery ? "Yes" : "No" }</p>
            {
                props.item.token &&
                <div className="item-token">
                    <p>Underlying token:</p>
                    <ul>
                        <li>Type: { props.item.token.type }</li>
                        <li>ID: { props.item.token.id }</li>
                        <li>Issuance: { props.item.token.issuance.toString() || "0" }</li>
                    </ul>
                </div>
            }
            {
                <div className="item-tcs">
                    <p>Terms and Conditions:</p>
                    { props.item.logionClassification && termsAncConditions(props.item.logionClassification, "LITC version LOC") }
                    { props.item.specificLicense && termsAncConditions(props.item.specificLicense, "Specific License LOC") }
                    { props.item.creativeCommons && termsAncConditions(props.item.creativeCommons, "CC Attribution LOC") }
                    { props.item.logionClassification === undefined && props.item.specificLicense === undefined &&
                        <ul>
                            <li>None</li>
                        </ul>
                    }
                </div>
            }
        </div>
    );
}
