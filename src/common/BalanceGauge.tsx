import { Lgnt, TypesAccountData } from "@logion/node-api";
import Gauge from "./Gauge";
import { balanceLevel, useAvailableMemo } from "./Amount";

export interface Props {
    balance?: TypesAccountData;
}

export default function BalanceGauge(props: Props) {

    const balance = useAvailableMemo(props.balance);

    return (
        <Gauge
            readingIntegerPart={ balance.coefficient.toInteger() }
            readingDecimalPart={ balance.coefficient.toFixedPrecisionDecimals(2) }
            unit={ balance.prefix.symbol + Lgnt.CODE }
            level={ balanceLevel(balance) }
        />
    );
}
