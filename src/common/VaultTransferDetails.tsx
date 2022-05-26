import { VaultTransferRequest } from "@logion/client";

import Detail from "./Detail";

export interface Props {
    request : VaultTransferRequest;
}

export default function VaultTransferRequestDetails(props: Props) {

    return (
        <>
            <Detail
                label="Reason"
                value={ props.request.decision?.rejectReason || "-" }
            />
        </>
    );
}
