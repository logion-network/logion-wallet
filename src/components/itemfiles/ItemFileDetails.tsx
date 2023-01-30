import { CheckCertifiedCopyResult, CheckResultType } from "@logion/client";
import { useCommonContext } from "src/common/CommonContext";
import Table, { DateTimeCell, EmptyTableMessage } from "src/common/Table";
import { CheckLatestDeliveryResponse } from "src/loc/FileModel";
import CellWithCopyPaste from "../table/CellWithCopyPaste";

import "./ItemFileDetails.css";

export interface Props {
    deliveries: CheckLatestDeliveryResponse[];
    checkResult?: CheckCertifiedCopyResult;
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
                rowStyle={ delivery => rowStyle(props.checkResult, delivery) }
            />
        </div>
    );
}

function rowStyle(checkResult: CheckCertifiedCopyResult | undefined, delivery: CheckLatestDeliveryResponse): string {
    if(!checkResult || !checkResult.match || delivery.copyHash !== checkResult.match.copyHash) {
        return "";
    } else {
        if(checkResult.summary === CheckResultType.POSITIVE) {
            return "positive-match";
        } else {
            return "negative-match";
        }
    }
}
