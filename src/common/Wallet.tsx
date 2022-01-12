import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';

import { CoinBalance, prefixedLogBalance, SYMBOL } from '../logion-chain/Balances';

import { useCommonContext } from './CommonContext';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Table, { Cell, DateCell, EmptyTableMessage, ActionCell } from './Table';
import Icon from './Icon';
import Button from './Button';
import WalletGauge from './WalletGauge';
import Loader from './Loader';
import { Transaction } from './types/ModelTypes';

import './Wallet.css';
import NetworkWarning from './NetworkWarning';

export interface Props {
    transactionsPath: (coinId: string) => string,
    settingsPath: string;
}

export default function Wallet(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            className="Wallet"
            mainTitle="Wallet"
            titleIcon={{
                icon: {
                    id: 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Content { ...props } />
        </FullWidthPane>
    );
}

export function Content(props: Props) {
    const { balances, transactions, nodesDown } = useCommonContext();
    const navigate = useNavigate();

    if(balances === null || transactions === null) {
        return <Loader />;
    }

    const latestTransaction = transactions[0];

    const gaugeCoin = balances[0].coin;
    return (
        <>
        {
            nodesDown.length > 0 &&
            <Row>
                <Col>
                    <NetworkWarning settingsPath={ props.settingsPath } />
                </Col>
            </Row>
        }
        <Row>
            <Col xxl={8}>
                <Frame
                    title="Asset balances"
                    fillHeight
                >
                    <Table
                        columns={[
                            {
                                header: "",
                                render: coinBalance => <Icon icon={{id: coinBalance.coin.iconId}} type={ coinBalance.coin.iconType } height="36px" width="auto" />,
                                width: "70px",
                            },
                            {
                                header: "Asset name",
                                render: balance => <AssetNameCell balance={ balance } />,
                                width: "200px",
                                align: 'left',
                            },
                            {
                                header: "Balance",
                                render: balance => <Cell content={ balance.balance.coefficient.toFixedPrecision(2) } />,
                                width: "140px",
                                align: 'right',
                            },
                            {
                                header: "Last transaction date",
                                render: balance => <DateCell dateTime={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? latestTransaction.createdOn : null } />
                            },
                            {
                                header: "Last transaction type",
                                render: balance => <Cell content={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? latestTransaction.type : "-" } />
                            },
                            {
                                header: "Last transaction amount",
                                render: balance => <Cell content={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? prefixedLogBalance(transactionAmount(latestTransaction)).convertTo(balance.balance.prefix).coefficient.toFixedPrecision(2) : '-' } />,
                                align: 'right',
                            },
                            {
                                header: "",
                                render: balance => balance.coin.id !== 'dot' ? <ActionCell><Button onClick={() => navigate(props.transactionsPath(balance.coin.id))}>More</Button></ActionCell> : <NotAvailable/>,
                                width: "201px",
                            }
                        ]}
                        data={ balances }
                        renderEmpty={ () => <EmptyTableMessage>You have no asset yet</EmptyTableMessage> }
                    />
                </Frame>
            </Col>
            <Col xxl={4}>
                <Frame
                    fillHeight
                    title={
                        <div className="gauge-title">
                            <Icon icon={ { id: gaugeCoin.iconId } } type={ gaugeCoin.iconType } height="72px"
                                    width="auto" />
                            <span>Current { SYMBOL } balance</span>
                        </div>
                    }
                    className="gauge-container"
                >
                    <WalletGauge
                        coin={ gaugeCoin }
                        balance={ balances[0].balance }
                        level={ balances[0].level }
                        type='arc'
                    />
                </Frame>
            </Col>
        </Row>
        </>
    );
}

interface AssetNameCellProps {
    balance: CoinBalance,
}

export function AssetNameCell(props: AssetNameCellProps) {

    return (
        <div className="asset-name-cell">
            <span className="name">{ props.balance.coin.name } ({ props.balance.balance.prefix.symbol }{ props.balance.coin.symbol })</span>
        </div>
    );
}

function NotAvailable() {

    return (
        <div className="not-available">
            <span>Not available (yet)</span>
        </div>
    );
}

function transactionAmount(transaction: Transaction): string {
    if(transaction.type === 'Received') {
        return transaction.transferValue;
    } else if(transaction.type === 'Sent') {
        return "-" + transaction.transferValue;
    } else {
        return transaction.total;
    }
}
