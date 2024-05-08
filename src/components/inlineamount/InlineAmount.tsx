import { Lgnt } from "@logion/node-api";

import "./InlineAmount.css";
import { useMemo } from "react";
import { toOptimizedNumber } from "src/common/Amount";

export interface Props {
    amount: Lgnt;
}

export default function InlineAmount(props: Props) {

    const amount = useMemo(() => {
        return toOptimizedNumber(props.amount);
    }, [ props.amount ]);

    return (
        <span className="InlineAmount">
            <span className="amount">{ amount.coefficient.toFixedPrecision(2) }</span>{" "}
            <span className="symbol">{ amount.prefix.symbol + Lgnt.CODE }</span>
        </span>
    );
}
