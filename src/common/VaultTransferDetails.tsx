import Detail from "./Detail";
import { VaultTransferRequest } from "../vault/VaultApi";

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
