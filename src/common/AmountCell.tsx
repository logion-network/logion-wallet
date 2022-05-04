import { PrefixedNumber } from "logion-api/dist/numbers";
import AmountFormat from "./AmountFormat";
import { Cell } from "./Table";

export interface Props {
    amount: PrefixedNumber | null,
}

export default function AmountCell(props: Props) {
    if(props.amount === null) {
        return <Cell content="-" align="right" />;
    } else {
        return (
            <Cell content={ <AmountFormat amount={ props.amount } /> } align="right" />
        );
    }
}
