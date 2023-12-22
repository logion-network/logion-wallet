import { Numbers, Lgnt } from "@logion/node-api";
import AmountFormat from "./AmountFormat";
import { Cell } from "./Table";

export interface Props {
    amount: Lgnt | null,
    unit?: Numbers.UnitPrefix,
}

export default function AmountCell(props: Props) {
    if(props.amount === null) {
        return <Cell content="-" align="right" />;
    } else {
        return (
            <Cell content={ <AmountFormat amount={ props.amount } unit={ props.unit }/> } align="right" />
        );
    }
}
