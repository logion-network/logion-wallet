import React from 'react';

import { ORANGE, RED } from "./ColorTheme";
import StatusCell from "./StatusCell";
import { VaultTransferRequestStatus } from '../vault/VaultApi';

export interface Props {
    status: VaultTransferRequestStatus;
}

export default function VaultTransferRequestStatusCell(props: Props) {

    let icon;
    let text;
    let color;
    if(props.status === "REJECTED") {
        color = RED;
        icon = { id: "rejected" };
        text = "Rejected";
    } else if(props.status === "PENDING") {
        color = ORANGE;
        icon = { id: "pending" };
        text = "Pending";
    } else if(props.status === "CANCELLED") {
        color = ORANGE;
        icon = undefined;
        text = "Cancelled";
    } else {
        return null;
    }

    return (
        <StatusCell
            color={ color }
            text={ text }
            icon={ icon }
        />
    );
}
