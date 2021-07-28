import { PrefixedNumber } from '../logion-chain/numbers';
import { Coin } from '../logion-chain/Balances';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';
import { ColorTheme } from './ColorTheme';

import './WalletGauge.css';

export interface Props {
    coin: Coin,
    balance: PrefixedNumber,
    colorTheme: ColorTheme,
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
                colorThemeType={ props.colorTheme.type }
            />
            <div className="actions">
                <Button colors={ props.colorTheme.buttons } slim><Icon icon={{id:'send'}} /> Send</Button>
                <Button colors={ props.colorTheme.buttons } slim><Icon icon={{id:'buy'}} /> Buy</Button>
            </div>
        </div>
    );
}
