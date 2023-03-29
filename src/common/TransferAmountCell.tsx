import { Transaction } from "@logion/client/dist/TransactionClient.js";
import { prefixedLogBalance, NONE, PrefixedNumber } from "@logion/node-api";

import { GREEN, RED } from "./ColorTheme";
import Icon from "./Icon";
import { Cell } from "./Table";

import './TransferAmountCell.css';

export interface Props {
    amount: PrefixedNumber | null,
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

export function transferBalance(address: string, transaction: Transaction): PrefixedNumber {
    const amount = prefixedLogBalance(transaction.transferValue);
    if(transaction.from === address) {
        return amount.negate();
    } else {
        return amount;
    }
}

export function fees(address: string, transaction: Transaction): PrefixedNumber {
    const amount = prefixedLogBalance(transaction.fees.total);
    if(transaction.from === address) {
        return amount;
    } else {
        return new PrefixedNumber("0", NONE);
    }
}

export function deposit(address: string, transaction: Transaction): PrefixedNumber {
    const amount = prefixedLogBalance(transaction.reserved);
    if(transaction.from === address) {
        return amount;
    } else {
        return new PrefixedNumber("0", NONE);
    }
}
