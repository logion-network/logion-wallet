import { PrefixedNumber } from '../logion-chain/numbers';
import { Coin } from '../logion-chain/Balances';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';

import './WalletGauge.css';

export interface Props {
    coin: Coin,
    balance: PrefixedNumber,
    level: number,
    type: 'arc' | 'linear',
}

export default function WalletGauge(props: Props) {

    return (
        <div className={ "WalletGauge " + props.type }>
            <Gauge
                readingIntegerPart={ props.balance.coefficient.toInteger() }
                readingDecimalPart={ props.balance.coefficient.toFixedPrecisionDecimals(2) }
                unit={ props.balance.prefix.symbol + "LOG" }
                level={ props.level }
                type={ props.type }
            />
            <div className="actions">
                <Button slim><Icon icon={{id:'send'}} /> Send</Button>
                <Button slim><Icon icon={{id:'buy'}} /> Buy</Button>
            </div>
        </div>
    );
}
