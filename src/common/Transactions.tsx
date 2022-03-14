import { useParams, useNavigate } from 'react-router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { Coin, prefixedLogBalance, CoinBalance } from '../logion-chain/Balances';

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
import Loader from './Loader';
import { useResponsiveContext } from './Responsive';
import { Transaction } from "./types/ModelTypes";
import { WalletType } from "./Wallet";
import VaultOutRequest from "../vault/VaultOutRequest";
import React from "react";
import { enrichTransactionType } from "./Model";

export interface Props {
    address: string,
    backPath: string,
    balances: CoinBalance[] | null,
    transactions: Transaction[] | null,
    type: WalletType,
    vaultAddress?: string,
}

export default function Transactions(props: Props) {
    const { colorTheme } = useCommonContext();
    const { address, balances, transactions, type, vaultAddress } = props;
    const navigate = useNavigate();

    if (balances === null || transactions === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="Transactions"
            mainTitle={ type }
            titleIcon={ {
                icon: {
                    id: type === "Vault" ? 'vault' : 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => navigate(props.backPath) }
        >
            <Content address={ address } balances={ balances } transactions={ transactions } type={ type } vaultAddress={ vaultAddress }/>
        </FullWidthPane>
    );
}

interface ContentProps {
    address: string,
    balances: CoinBalance[],
    transactions: Transaction[],
    type: WalletType,
    vaultAddress?: string,
}

function Content(props: ContentProps) {
    const { address, balances, transactions, type, vaultAddress } = props;
    const { coinId } = useParams<"coinId">();
    const { width } = useResponsiveContext();

    if (balances === null || transactions === null) {
        return <Loader />;
    }

    const balance = balances.filter(balance => balance.coin.id === coinId)[0];
    return (
        <>
            <Row>
                <Col>
                    <Frame className={ `Frame-${ type }` }
                        title={ <TransactionsFrameTitle coin={ balance.coin } vaultOutButton={ type === "Vault" }/> }
                    >
                        <Table
                            columns={ [
                                {
                                    header: "Status",
                                    render: transaction => <TransactionStatusCell transaction={ transaction } />,
                                    renderDetails: transaction => <TransactionStatusCellDetails transaction={ transaction } />,
                                    width: width({
                                        onSmallScreen: "80px",
                                        otherwise: "100px"
                                    }),
                                },
                                {
                                    header: "Transaction date",
                                    render: transaction => <DateCell dateTime={ transaction.createdOn } />,
                                    width: width({
                                        onSmallScreen: "100px",
                                        otherwise: "150px"
                                    }),
                                },
                                {
                                    header: <FromToHeader />,
                                    render: transaction => <FromToCell from={ transaction.from }
                                                                       to={ transaction.to } />,
                                },
                                {
                                    header: "Transaction type",
                                    render: transaction => <Cell content={ enrichTransactionType(transaction, vaultAddress) } />,
                                    width: width({
                                        onSmallScreen: "180px",
                                        otherwise: "250px"
                                    }),
                                },
                                {
                                    header: "Amount",
                                    render: transaction => <TransferAmountCell amount={ transferBalance(address, transaction) } />,
                                    align: 'right',
                                    width: width({
                                        onSmallScreen: "100px",
                                        otherwise: "120px"
                                    }),
                                },
                                {
                                    header: "Paid fees",
                                    render: transaction => <AmountCell amount={ prefixedLogBalance(transaction.fee) } />,
                                    align: 'right',
                                    width: width({
                                        onSmallScreen: "80px",
                                        otherwise: "120px"
                                    }),
                                },
                                {
                                    header: "Deposit",
                                    render: transaction => <AmountCell amount={ prefixedLogBalance(transaction.reserved) } />,
                                    align: 'right',
                                    width: width({
                                        onSmallScreen: "80px",
                                        otherwise: "120px"
                                    }),
                                }
                            ]}
                            data={ transactions }
                            renderEmpty={ () => <EmptyTableMessage>No transaction yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
            </Row>
            { type === "Wallet" &&
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
                                vaultAddress={ vaultAddress }
                            />
                        </Frame>
                    </Col>
                </Row>
            }
            { type === "Vault" &&
                <Row>
                    <Col className="col-xxxl-8"/>
                    <Col className="col-xxxl-4">
                        <Frame
                            fillHeight
                            title={
                                <div className="gauge-title">
                                    <Icon icon={ { id: balance.coin.iconId } } type={ balance.coin.iconType } height="72px"
                                          width="auto" />
                                    <span>Current { balance.coin.name } balance</span>
                                </div>
                            }
                            className="gauge-container"
                        >
                            <WalletGauge
                                coin={ balance.coin }
                                balance={ balance.balance }
                                type='arc'
                                level={ balance.level }
                                sendButton={ false }
                            />
                        </Frame>
                    </Col>
                </Row>
            }
        </>
    );
}

function TransactionsFrameTitle(props: { coin: Coin, vaultOutButton: boolean }) {
    return (
        <Row>
            <Col>
                <span className="frame-title">
                    Transaction history: <Icon
                    icon={ { id: props.coin.iconId } }
                    type={ props.coin.iconType }
                /> { props.coin.name } ({ props.coin.symbol })
                </span>
            </Col>
            { props.vaultOutButton &&
            <Col>
                <VaultOutRequest/>
            </Col>
            }
        </Row>
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
