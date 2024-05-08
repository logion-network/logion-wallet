import { Lgnt, TypesAccountData } from '@logion/node-api';
import './Reading.css';
import Reading from './Reading';
import { balanceLevel, useAvailableMemo } from './Amount';

export interface Props {
    balance?: TypesAccountData;
}

export default function BalanceReading(props: Props) {

    const balance = useAvailableMemo(props.balance);

    return (
        <Reading
            readingIntegerPart={ balance.coefficient.toInteger() }
            readingDecimalPart={ balance.coefficient.toFixedPrecisionDecimals(2) }
            unit={ balance.prefix.symbol + Lgnt.CODE }
            level={ balanceLevel(balance) }
        />
    );
}
