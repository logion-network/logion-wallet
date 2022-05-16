import { UUID } from "@logion/node-api/dist/UUID";
import { CollectionItem } from "@logion/node-api/dist/Types";

import PolkadotFrame from "../common/PolkadotFrame";
import { useCommonContext } from "../common/CommonContext";
import Icon from "../common/Icon";
import IconTextRow from "../common/IconTextRow";

import "./CollectionLocItemChecker.css"
import ImportItems from "./ImportItems";

export interface Props {
    locId: UUID;
    collectionItem?: CollectionItem;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export default function ItemImporter(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <PolkadotFrame className="ItemImporter" colorTheme={ colorTheme }>
            <IconTextRow
                icon={ <Icon icon={ { id: "polkadot_import_items" } } width="45px" /> }
                text={ <>
                    <p className="text-title">Import items</p>
                    <p>Add items to your Collection LOC by submitting a CSV file. The CSV file should have at least 2 columns and no header row.
                        It must be UTF-8 encoded, cells be comma-separated and cell values may be double quoted.
                    </p>
                    <p>The first column contains the item identifiers. An item identifier must be 32-bytes long and encoded as a "0x" prefixed
                        hex string (i.e. "0x" followed by 64 hexdecimal digits). <strong>If it is not the case, the tool will automatically hash the value and use the result as the item's
                        identifier.</strong> If you are submitting items for files, we recommend to use the SHA-256 hash of each file as the item ID.</p>
                    <p>The second column is the description of the item and must be at most 4096 bytes long (UTF-8).</p>
                    <ImportItems
                        collectionId={ props.locId }
                    />
                </>
                } />
        </PolkadotFrame>
    );
}
