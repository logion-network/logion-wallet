import { Fees } from "@logion/node-api";
import EstimatedFees, { geInclusionFeePaidBy, getOtherFeesPaidBy } from "./fees/EstimatedFees";
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

    if(!loc) {
        return null;
    }

    return (
        <EstimatedFees
            fees={ props.fees }
            centered={ props.centered }
            hideTitle={ props.hideTitle }
            inclusionFeePaidBy={ geInclusionFeePaidBy(loc, props.locItem) }
            otherFeesPaidBy={ getOtherFeesPaidBy(loc) }
        />
    );
}
