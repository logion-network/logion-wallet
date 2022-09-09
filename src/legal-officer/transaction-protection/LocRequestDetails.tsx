import { LocRequest } from "../../common/types/ModelTypes";
import TransactionLocRequestDetails from "./TransactionLocRequestDetails";
import IdentityLocRequestDetails from "./IdentityLocRequestDetails";

export interface LocRequestDetailsProps {
    request: LocRequest,
}

export default function LocRequestDetails(props: LocRequestDetailsProps) {

    const { request } = props;

    if (request.locType === "Identity") {
        return <IdentityLocRequestDetails request={ request } />
    } else {
        return <TransactionLocRequestDetails request={ request } />
    }
}
