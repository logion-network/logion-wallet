import { ProtectionRequestStatus as ProtectionRequestStatusType } from '@logion/client/dist/RecoveryClient.js';

import Icon from "../common/Icon";
import { ORANGE, GREEN, RED, YELLOW } from "../common/ColorTheme";

import './ProtectionRequestStatus.css';

export interface Props {
    status: ProtectionRequestStatusType,
}

export default function ProtectionRequestStatus(props: Props) {

    let icon;
    let status;
    let statusColor: string | undefined = undefined;
    if(props.status === "PENDING") {
        statusColor = ORANGE;
        icon = (<Icon icon={{ id: "pending" }} />);
        status = <span style={{color: statusColor}}>Pending</span>;
    } else if(props.status === "ACCEPTED") {
        statusColor = YELLOW;
        icon = (<Icon icon={{ id: "accepted" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
    } else if(props.status === "ACTIVATED") {
        statusColor = GREEN;
        icon = (<Icon icon={{ id: "activated" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
    } else if(props.status === "REJECTED") {
        statusColor = RED;
        icon = (<Icon icon={{ id: "rejected" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Rejected</span>;
    } else if(props.status === "CANCELLED" || props.status === "ACCEPTED_CANCELLED" || props.status === "REJECTED_CANCELLED") {
        statusColor = RED;
        icon = (<Icon icon={{ id: "void_label" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Cancelled</span>;
    } else {
        icon = null;
        status = null;
    }

    return (
        <span
            className="ProtectionRequestStatus"
            style={{
                borderColor: statusColor
            }}
        >
            { icon } { status }
        </span>
    );
}
