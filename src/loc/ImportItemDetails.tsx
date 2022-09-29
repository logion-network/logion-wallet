import {
    ItemFileWithContent,
    ItemTokenWithRestrictedType,
    SpecificLicense,
    LogionClassification
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
}

export default function ImportItemDetails(props: { item: Item }) {
    return (
        <div className="ImportItemDetails">
            {
                props.item.error &&
                <p className="error-message">{ props.item.error }</p>
            }
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
            <p className="item-delivery">Restricted delivery: { props.item.restrictedDelivery ? "Yes" : "No" }</p>
            {
                props.item.token &&
                <div className="item-token">
                    <p>Underlying token:</p>
                    <ul>
                        <li>Type: { props.item.token.type }</li>
                        <li>ID: { props.item.token.id }</li>
                    </ul>
                </div>
            }
        </div>
    );
}
