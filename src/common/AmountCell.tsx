import { PrefixedNumber } from "../logion-chain/numbers";
import { Cell } from "./Table";

export interface Props {
    amount: PrefixedNumber | null,
}

export default function AmountCell(props: Props) {
    if(props.amount === null) {
        return <Cell content="-" align="right" />;
    } else {
        return (
            <Cell content={ props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol } align="right" />
        );
    }
}
