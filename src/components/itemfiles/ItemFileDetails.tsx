import { UploadableItemFile } from "@logion/client/dist/LocClient";
import { useCommonContext } from "src/common/CommonContext";
import Table, { DateTimeCell, EmptyTableMessage } from "src/common/Table";
import { CheckLatestDeliveryResponse } from "src/loc/FileModel";
import CellWithCopyPaste from "../table/CellWithCopyPaste";

import "./ItemFileDetails.css";

export interface Props {
    file: UploadableItemFile;
    deliveries: CheckLatestDeliveryResponse[];
}

export default function ItemFileDetails(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <div className="ItemFileDetails">
            <Table
                columns={[
                    {
                        header: "Delivered File Hash",
                        render: delivery => <CellWithCopyPaste content={ delivery.copyHash } />,
                        align: "left",
                    },
                    {
                        header: "NFT Owner Address (recipient)",
                        render: delivery => <CellWithCopyPaste content={ delivery.owner } />,
                        align: "left",
                    },
                    {
                        header: "Delivery Date",
                        render: delivery => <DateTimeCell dateTime={ delivery.generatedOn } />,
                        width: "150px",
                    },
                ]}
                data={ props.deliveries }
                renderEmpty={ () => <EmptyTableMessage>File has not been delivered yet</EmptyTableMessage> }
                color={{
                    ...colorTheme.table,
                    header: colorTheme.table.row
                }}
            />
        </div>
    );
}
