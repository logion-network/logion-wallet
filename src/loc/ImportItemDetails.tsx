import { CollectionItem } from "logion-api/dist/Types";

import './ImportItemDetails.css';

export interface Item extends CollectionItem {
    error?: string;
    submitted: boolean;
    failed: boolean;
    success: boolean;
}

export default function ImportItemDetails(props: { item: Item }) {
    return (
        <div className="ImportItemDetails">
            <pre>{ props.item.description }</pre>
        </div>
    );
}
