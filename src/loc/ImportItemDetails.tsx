import { CollectionItem } from "@logion/node-api/dist/Types";

import './ImportItemDetails.css';

export type ErrorType = 'validation' | 'chain' | 'upload';

export interface Item extends CollectionItem {
    error?: string;
    errorType?: ErrorType;
    submitted: boolean;
    failed: boolean;
    success: boolean;
    upload: boolean;
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
                        <li>Content type: { props.item.files[0].contentType }</li>
                        <li>Hash: { props.item.files[0].hash }</li>
                        <li>Size: { props.item.files[0].size.toString() } bytes</li>
                    </ul>
                </div>
            }
        </div>
    );
}
