import { Transaction } from "@logion/client";
import { Lgnt, LgntFormatter, ValidAccountId } from "@logion/node-api";

import { GREEN, RED } from "./ColorTheme";
import Icon from "./Icon";
import { Cell } from "./Table";

import './TransferAmountCell.css';
import { toUnit } from "./AmountFormat";
import { toFeesClass } from "@logion/client";

export interface Props {
    amount: Lgnt | null,
}

export default function TransferAmountCell(props: Props) {
    const formatter = new LgntFormatter(2, toUnit(props.amount || Lgnt.zero()));
    if(props.amount === null) {
        return <Cell content="-" align="center" />;
    } else if(props.amount.isNegative()) {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'send_red'}} />
                <span className="number" style={{color: RED}}>
                    { formatter.format(props.amount) }
                </span>
            </div>
        );
    } else if(props.amount.equalTo(Lgnt.zero())) {
        return (
            <div className="TransferAmountCell" style={{justifyContent: 'flex-end'}}>
                <span className="number">
                    { formatter.format(props.amount) }
                </span>
            </div>
        );
    } else {
        return (
            <div className="TransferAmountCell">
                <Icon icon={{id: 'receive_green'}} />
                <span className="number" style={{color: GREEN}}>
                    { formatter.format(props.amount) }
                </span>
            </div>
        );
    }
}

export function transferBalance(account: ValidAccountId | undefined, transaction: Transaction): Lgnt {
    const amount = Lgnt.fromCanonical(BigInt(transaction.transferValue));
    if(transaction.from.equals(account)) {
        return amount.negate();
    } else {
        return amount;
    }
}

export function fees(account: ValidAccountId | undefined, transaction: Transaction): Lgnt {
    const amount = toFeesClass(transaction.fees)?.totalFee || Lgnt.zero();
    if(transaction.from.equals(account)) {
        return amount;
    } else {
        return Lgnt.zero();
    }
}

export function deposit(account: ValidAccountId | undefined, transaction: Transaction): Lgnt {
    const amount = Lgnt.fromCanonical(BigInt(transaction.reserved));
    if(transaction.from.equals(account)) {
        return amount;
    } else {
        return Lgnt.zero();
    }
}
