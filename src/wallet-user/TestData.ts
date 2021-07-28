import { Coin, CoinBalance } from '../logion-chain/Balances';
import { PrefixedNumber, ATTO } from '../logion-chain/numbers';
import { Transaction } from './Types';

export const TEST_WALLET_USER = "5H4MvAsobfZ6bBCDyj5dsrWYLrA8HrRzaqa9p61UXtxMhSCY";

export const DEFAULT_COIN: Coin = {
    id: 'log',
    iconId: 'log',
    iconType: 'png',
    name: "Logion",
    symbol: "LOG"
};

export const DEFAULT_COIN_BALANCE: CoinBalance = {
    coin: DEFAULT_COIN,
    balance: new PrefixedNumber("42", ATTO),
    level: 0.1,
};

export const DEFAULT_TRANSACTION: Transaction = {
    from: "from",
    to: "to",
    pallet: "pallet",
    method: "method",
    transferValue: "420",
    tip: "0",
    fee: "125000",
    reserved: "0",
    total: "125420",
    createdOn: "2021-07-28T12:30:00.000",
    type: "Sent",
}
