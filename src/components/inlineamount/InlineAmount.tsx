import { Coin, Numbers } from "@logion/node-api";

import "./InlineAmount.css";

export interface Props {
    coin: Coin;
    amount: Numbers.PrefixedNumber;
}

export default function InlineAmount(props: Props) {
    return (
        <span className="InlineAmount">
            <span className="amount">{ props.amount.coefficient.toFixedPrecision(2) }</span>{" "}
            <span className="symbol">{ props.amount.prefix.symbol + props.coin.symbol }</span>
        </span>
    );
}
