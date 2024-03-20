import { LocData } from "@logion/client";
import { Lgnt } from "@logion/node-api";

import "./TransactionInfo.css";
import AmountFormat from "src/common/AmountFormat";
import { useMemo } from "react";

export interface Props {
    loc: LocData;
}

const DEFAULT_LEGAL_FEE = 2000n;

export default function LegalFeeAmount(props: Props) {

    const legalFee = useMemo(() => {
        if(props.loc.requesterAddress === undefined) {
            return { value: Lgnt.zero(), custom: true };
        } else {
            if(props.loc.fees.legalFee !== undefined) {
                return { value: props.loc.fees.legalFee, custom: true };
            } else {
                return { value: Lgnt.from(DEFAULT_LEGAL_FEE), custom: false };
            }
        }
    }, [ props.loc ]);

    return (
        <span>
            <AmountFormat amount={ legalFee.value }/>{ Lgnt.CODE }{ legalFee.custom ? "" : " (default fee)" }
        </span>
    )
}
