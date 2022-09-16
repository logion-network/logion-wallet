import { LocRequest } from "../../common/types/ModelTypes";
import TransactionLocRequestDetails from "./TransactionLocRequestDetails";
import IdentityLocRequestDetails from "../../components/identity/IdentityLocRequestDetails";

export interface LocRequestDetailsProps {
    request: LocRequest,
}

export default function LocRequestDetails(props: LocRequestDetailsProps) {

    const { request } = props;

    if (request.locType === "Identity") {
        return <IdentityLocRequestDetails personalInfo={ request }/>
    } else {
        return <TransactionLocRequestDetails request={ request } />
    }
}
