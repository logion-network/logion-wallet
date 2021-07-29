import { useParams, useHistory } from 'react-router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { PrefixedNumber } from '../logion-chain/numbers';
import { Coin, prefixedLogBalance } from '../logion-chain/Balances';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Icon from './Icon';
import Table, { DateCell, Cell, EmptyTableMessage } from './Table';
import { ColorTheme, RED, GREEN } from './ColorTheme';

import { useRootContext } from '../RootContext';

import WalletGauge from './WalletGauge';

import './Transactions.css';
import { Transaction } from './types/ModelTypes';

export interface Props {
    backPath: string,
    colorTheme: ColorTheme,
}

export default function Transactions(props: Props) {
    const { selectAddress, addresses, balances, transactions } = useRootContext();
    const { coinId } = useParams<{ coinId: string }>();
    const history = useHistory();

    if(addresses === null || selectAddress === null || balances === null || transactions === null) {
        return null;
    }

    const balance = balances.filter(balance => balance.coin.id === coinId)[0];

    return (
        <FullWidthPane
            className="Transactions"
            mainTitle="Wallet"
            titleIcon={{
                icon: {
                    id: 'wallet'
                },
                background: props.colorTheme.topMenuItems.iconGradient,
            }}
            colors={ props.colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            onBack={ () => history.push(props.backPath) }
        >
            <Row>
                <Col>
                    <Frame
                        colors={ props.colorTheme }
                        title={ <TransactionsFrameTitle coin={ balance.coin } /> }
                    >
                        <Table
                            colorTheme={ props.colorTheme }
                            columns={[
                                {
                                    header: "Transaction date",
                                    render: transaction => <DateCell dateTime={ transaction.createdOn } />,
                                    width: "200px",
                                },
                                {
                                    header: <FromToHeader />,
                                    render: transaction => <FromToCell from={ transaction.from } to={ transaction.to } />,
                                    width: "692px",
                                },
                                {
                                    header: "Transaction type",
                                    render: transaction => <Cell content={ transaction.type } />
                                },
                                {
                                    header: "Amount",
                                    render: transaction => <TransferAmountCell amount={ transferBalance(transaction) } />,
                                    align: 'right',
                                    width: "120px",
                                },
                                {
                                    header: "Paid fees",
                                    render: transaction => <AmountCell amount={ prefixedLogBalance(transaction.fee) } />,
                                    align: 'right',
                                    width: "120px",
                                },
                                {
                                    header: "Deposit",
                                    render: transaction => <AmountCell amount={ prefixedLogBalance(transaction.reserved) } />,
                                    align: 'right',
                                    width: "120px",
                                }
                            ]}
                            data={ transactions }
                            renderEmpty={ () => <EmptyTableMessage>No transaction yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        colors={ props.colorTheme }
                        title={ <BalanceFrameTitle coin={ balance.coin } /> }
                    >
                        <WalletGauge
                            coin={ balance.coin }
                            balance={ balance.balance }
                            type='linear'
                            colorTheme={ props.colorTheme }
                            level={ balance.level }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );

    function transferBalance(transaction: Transaction): PrefixedNumber {
        const amount = prefixedLogBalance(transaction.transferValue);
        if(transaction.from === addresses!.currentAddress.address) {
            return amount.negate();
        } else {
            return amount;
        }
    }
}

function TransactionsFrameTitle(props: {coin: Coin}) {
    return (
        <span className="frame-title">
            Transaction history: <Icon
                icon={{id: props.coin.iconId}}
                type={ props.coin.iconType }
            /> { props.coin.name } ({ props.coin.symbol })
        </span>
    );
}

function BalanceFrameTitle(props: {coin: Coin}) {
    return (
        <span className="frame-title">
            Current { props.coin.symbol } balance
        </span>
    );
}

function FromToHeader() {
    return (
        <span className="from-to-header">
            <span className="from">From address</span>
            <span className="separator">&gt;</span>
            <span className="to">To address</span>
        </span>
    );
}

interface FromToCellProps {
    from: string,
    to: string | null,
}

function FromToCell(props: FromToCellProps) {
    return (
        <div className="from-to-cell">
            <span className="from">{ props.from }</span>
            <span className="to">{ props.to !== null ? props.to : "-" }</span>
        </div>
    );
}

export interface TransferAmountCellProps {
    amount: PrefixedNumber | null,
}

function TransferAmountCell(props: TransferAmountCellProps) {
    if(props.amount === null) {
        return <Cell content="-" align="center" />;
    } else if(props.amount.isNegative()) {
        return (
            <div className="amount-cell">
                <Icon icon={{id: 'send_red'}} />
                <span className="number" style={{color: RED}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else if(props.amount.coefficient.isZero()) {
        return (
            <div className="amount-cell" style={{justifyContent: 'flex-end'}}>
                <span className="number">
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    } else {
        return (
            <div className="amount-cell">
                <Icon icon={{id: 'receive_green'}} />
                <span className="number" style={{color: GREEN}}>
                    { props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol }
                </span>
            </div>
        );
    }
}

export interface AmountCellProps {
    amount: PrefixedNumber | null,
}

function AmountCell(props: AmountCellProps) {
    if(props.amount === null) {
        return <Cell content="-" align="right" />;
    } else {
        return (
            <Cell content={ props.amount.coefficient.toFixedPrecision(2) + " " + props.amount.prefix.symbol } align="right" />
        );
    }
}
