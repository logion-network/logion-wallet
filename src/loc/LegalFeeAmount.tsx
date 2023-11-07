import { LocData } from "@logion/client";
import { Currency } from "@logion/node-api";

import "./TransactionInfo.css";
import AmountFormat from "src/common/AmountFormat";
import { toPrefixedLgnt } from "src/common/AmountCell";
import { useMemo } from "react";

export interface Props {
    loc: LocData;
}

const DEFAULT_LEGAL_FEE = 2000n;

export default function LegalFeeAmount(props: Props) {

    const legalFee = useMemo(() => {
        if(props.loc.requesterLocId) {
            return { value: 0n, custom: true };
        } else {
            if(props.loc.fees.legalFee !== undefined) {
                return { value: props.loc.fees.legalFee, custom: true };
            } else {
                return { value: Currency.toCanonicalAmount(Currency.nLgnt(DEFAULT_LEGAL_FEE)), custom: false };
            }
        }
    }, [ props.loc ]);

    return (
        <span>
            <AmountFormat amount={
                toPrefixedLgnt(legalFee.value.toString())
            }/>{ Currency.SYMBOL }{ legalFee.custom ? "" : " (default fee)" }
        </span>
    )
}
