import { useParams, useNavigate } from 'react-router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { Coin, prefixedLogBalance } from '../logion-chain/Balances';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Icon from './Icon';
import Table, { DateCell, Cell, EmptyTableMessage } from './Table';

import { useCommonContext } from './CommonContext';

import WalletGauge from './WalletGauge';

import './Transactions.css';
import TransferAmountCell, { transferBalance } from './TransferAmountCell';
import AmountCell from './AmountCell';
import { TransactionStatusCell, TransactionStatusCellDetails } from "./TransactionStatusCell";

export interface Props {
    backPath: string,
}

export default function Transactions(props: Props) {
    const { accounts, balances, transactions, colorTheme } = useCommonContext();
    const { coinId } = useParams<"coinId">();
    const navigate = useNavigate();

    if (balances === null || transactions === null) {
        return null;
    }

    const balance = balances.filter(balance => balance.coin.id === coinId)[0];

    return (
        <FullWidthPane
            className="Transactions"
            mainTitle="Wallet"
            titleIcon={ {
                icon: {
                    id: 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => navigate(props.backPath) }
        >
            <Row>
                <Col>
                    <Frame
                        title={ <TransactionsFrameTitle coin={ balance.coin } /> }
                    >
                        <Table
                            columns={ [
                                {
                                    header: "Status",
                                    render: transaction => <TransactionStatusCell transaction={ transaction } />,
                                    renderDetails: transaction => <TransactionStatusCellDetails transaction={ transaction } />,
                                    width: "100px",
                                },
                                {
                                    header: "Transaction date",
                                    render: transaction => <DateCell dateTime={ transaction.createdOn } />,
                                    width: "150px",
                                },
                                {
                                    header: <FromToHeader />,
                                    render: transaction => <FromToCell from={ transaction.from }
                                                                       to={ transaction.to } />,
                                },
                                {
                                    header: "Transaction type",
                                    render: transaction => <Cell content={ transaction.type } />,
                                    width: "250px",
                                },
                                {
                                    header: "Amount",
                                    render: transaction => <TransferAmountCell amount={ transferBalance(accounts!, transaction) } />,
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
                        title={ <BalanceFrameTitle coin={ balance.coin } /> }
                    >
                        <WalletGauge
                            coin={ balance.coin }
                            balance={ balance.balance }
                            type='linear'
                            level={ balance.level }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
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
            <OverlayTrigger
              placement="bottom"
              delay={ 500 }
              overlay={
                <Tooltip id={`tooltip-${props.from}`}>
                  { props.from }
                </Tooltip>
              }
            >
                <span className="from">{ props.from }</span>
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              delay={ 500 }
              overlay={
                <Tooltip id={`tooltip-${props.to}`}>
                  { props.to }
                </Tooltip>
              }
            >
                <span className="to">{ props.to !== null ? props.to : "-" }</span>
            </OverlayTrigger>
        </div>
    );
}
