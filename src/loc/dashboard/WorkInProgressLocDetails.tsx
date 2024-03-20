import { LocData } from "@logion/client";
import Detail from "src/common/Detail";

export interface Props {
    locData: LocData;
}

export default function WorkInProgressLocDetails(props: Props) {
    return (
        <div className="WorkInProgressLocDetails">
            <Detail
                label="ID"
                value={ props.locData.id.toDecimalString() }
            />
            {
                props.locData.status === "REVIEW_REJECTED" &&
                <Detail
                    label="Reason"
                    value={ props.locData.rejectReason || "-" }
                />
            }
        </div>
    );
}
