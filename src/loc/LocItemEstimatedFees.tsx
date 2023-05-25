import { Fees } from "@logion/node-api";
import EstimatedFees from "./EstimatedFees";
import { LocItem } from "./LocItem";
import { useLocContext } from "./LocContext";

export interface Props {
    fees: Fees | undefined | null;
    locItem: LocItem;
    centered?: boolean;
    hideTitle?: boolean;
}

export default function LocItemEstimatedFees(props: Props) {
    const { loc } = useLocContext();

    return (
        <EstimatedFees
            fees={ props.fees }
            centered={ props.centered }
            hideTitle={ props.hideTitle }
            inclusionFeePaidBy={ props.locItem.submitter === loc?.ownerAddress ? "paid by Legal Officer" : "paid by submitter" }
            otherFeesPaidBy={ loc?.requesterLocId === undefined && loc?.sponsorshipId === undefined ? "paid by requester" : "paid by Legal Officer" }
        />
    );
}
