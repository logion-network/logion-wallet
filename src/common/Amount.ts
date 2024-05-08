import { Lgnt, Numbers, TypesAccountData } from "@logion/node-api";
import { useMemo } from "react";

export function useAvailableMemo(balance: TypesAccountData | undefined) {
    return useMemo(() => {
        if(balance) {
            return toOptimizedNumber(balance.available);
        } else {
            return Numbers.PrefixedNumber.ZERO;
        }
    }, [ balance ]);
}

export function toOptimizedNumber(amount: Lgnt) {
    return amount.toPrefixedNumber().optimizeScale(3);
}

export function balanceLevel(amount: Numbers.PrefixedNumber) {
    return amount.toNumber() === 0 ? 0 : 1;
}
