import { Transaction } from "@logion/client/dist/TransactionClient.js";
import { Numbers } from "@logion/node-api";

import { GREEN, RED } from "./ColorTheme";
import Icon from "./Icon";
import { Cell } from "./Table";

import './TransferAmountCell.css';
import { toPrefixedLgnt } from "./AmountCell";

export interface Props {
    amount: Numbers.PrefixedNumber | null,
}

export default function TransferAmountCell(props: Props) {
    if(props.amount === null) {
        return <Cell content="-" align="center" />;
    } else if(props.amount.isNegative()) {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'send_red'}} />
                <span className="number" style={{color: RED}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else if(props.amount.coefficient.isZero()) {
        return (
            <div className="TransferAmountCell" style={{justifyContent: 'flex-end'}}>
                <span className="number">
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'receive_green'}} />
                <span className="number" style={{color: GREEN}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    }
}

export function transferBalance(address: string, transaction: Transaction): Numbers.PrefixedNumber {
    const amount = toPrefixedLgnt(transaction.transferValue);
    if(transaction.from === address) {
        return amount.negate();
    } else {
        return amount;
    }
}

export function fees(address: string, transaction: Transaction): Numbers.PrefixedNumber {
    const amount = toPrefixedLgnt(transaction.fees.total);
    if(transaction.from === address) {
        return amount;
    } else {
        return new Numbers.PrefixedNumber("0", Numbers.NONE);
    }
}

export function deposit(address: string, transaction: Transaction): Numbers.PrefixedNumber {
    const amount = toPrefixedLgnt(transaction.reserved);
    if(transaction.from === address) {
        return amount;
    } else {
        return new Numbers.PrefixedNumber("0", Numbers.NONE);
    }
}
