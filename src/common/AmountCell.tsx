import { Currency, Numbers } from "@logion/node-api";
import AmountFormat from "./AmountFormat";
import { Cell } from "./Table";

export interface Props {
    amount: Numbers.PrefixedNumber | null,
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

export function toPrefixedLgnt(tokens: string): Numbers.PrefixedNumber {
    const scientific = Currency.toPrefixedNumberAmount(BigInt(tokens)).scientificNumber.optimizeScale(3);
    return Numbers.convertToPrefixed(scientific);
}
