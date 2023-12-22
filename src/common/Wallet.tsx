import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import { CoinBalance, Lgnt } from '@logion/node-api';

import { useCommonContext } from './CommonContext';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Table, { Cell, DateCell, EmptyTableMessage, ActionCell } from './Table';
import Button from './Button';
import WalletGauge from './WalletGauge';
import Loader from './Loader';

import './Wallet.css';
import NetworkWarning from './NetworkWarning';
import { useResponsiveContext } from './Responsive';
import { buildTransactionType } from "./TransactionType";
import { Transaction } from '@logion/client/dist/TransactionClient.js';
import AmountCell from './AmountCell';
import CoinIcon from 'src/components/coin/CoinIcon';
import CoinName from 'src/components/coin/CoinName';

export type WalletType = "Wallet" | "Vault"

export interface Props {
    transactionsPath: (coinId: string) => string,
    settingsPath: string,
    balances: CoinBalance[] | null,
    transactions: Transaction[] | null,
    address: string,
    vaultAddress?: string
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
            <Content { ...props } type="Wallet" />
        </FullWidthPane>
    );
}

export function Content(props: Props & { type: WalletType }) {
    const { nodesDown } = useCommonContext();
    const { balances, transactions, vaultAddress } = props;
    const navigate = useNavigate();
    const { width } = useResponsiveContext();

    if(balances === null || balances.length === 0 || transactions === null) {
        return <Loader />;
    }

    const latestTransaction = transactions[0];

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
            <div className={ props.type === "Wallet" ? "col-xxxl-8" : "col-xxxl-12" }>
                <Frame
                    title={ props.type === "Vault" ? "Assets under vault protection" : "Asset balances" }
                    fillHeight
                >
                    <Table
                        columns={[
                            {
                                header: "",
                                render: coinBalance => <CoinIcon coinId={ coinBalance.coin.id } height="36px" />,
                                width: "70px",
                            },
                            {
                                header: "Asset name",
                                render: balance => <AssetNameCell balance={ balance } />,
                                width: width({
                                    onSmallScreen: "180px",
                                    otherwise: "200px"
                                }),
                                align: 'left',
                            },
                            {
                                header: "Balance",
                                render: balance => <Cell content={ balance.available.coefficient.toFixedPrecision(2) } />,
                                width: width({
                                    onSmallScreen: "120px",
                                    otherwise: "140px"
                                }),
                                align: 'right',
                            },
                            {
                                header: "Last transaction date",
                                render: balance => <DateCell dateTime={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? latestTransaction.createdOn : null } />
                            },
                            {
                                header: "Last transaction type",
                                render: balance => <Cell content={ balance.coin.id !== 'dot' && latestTransaction !== undefined ? buildTransactionType({ transaction: latestTransaction, address: props.address, walletType: "Wallet", vaultAddress: props.vaultAddress }) : "-" } />
                            },
                            {
                                header: "Last transaction amount",
                                render: balance => <AmountCell amount={ balance.coin.id !== 'dot' ? transactionAmount(latestTransaction) : null }/>,
                                align: 'right',
                            },
                            {
                                header: "",
                                render: balance => balance.coin.id !== 'dot' ? <ActionCell><Button onClick={() => navigate(props.transactionsPath(balance.coin.id))}>More</Button></ActionCell> : <NotAvailable/>,
                                width: width({
                                    onSmallScreen: "184px",
                                    otherwise: "201px"
                                }),
                            }
                        ]}
                        data={ balances }
                        renderEmpty={ () => <EmptyTableMessage>You have no asset yet</EmptyTableMessage> }
                    />
                </Frame>
            </div>
            { props.type === "Wallet" &&
                <div className="col-xxxl-4">
                    <Frame
                        fillHeight
                        title={
                            <div className="gauge-title">
                                <CoinIcon coinId={ balances[0].coin.id } height="72px" />
                                <span>Current { Lgnt.CODE } balance</span>
                            </div>
                        }
                        className="gauge-container"
                    >
                        <WalletGauge
                            balance={ balances[0] }
                            type='arc'
                            vaultAddress={ vaultAddress }
                        />
                    </Frame>
                </div>
            }
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
            <span className="name"><CoinName coinId={ props.balance.coin.id }/> ({ props.balance.available.prefix.symbol }{ props.balance.coin.symbol })</span>
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

function transactionAmount(transaction: Transaction): Lgnt {
    if(transaction.transferDirection === 'Received') {
        return Lgnt.fromCanonical(BigInt(transaction.transferValue));
    } else if(transaction.transferDirection === 'Sent') {
        return Lgnt.fromCanonical(BigInt(transaction.transferValue)).negate();
    } else {
        return Lgnt.fromCanonical(BigInt(transaction.total));
    }
}
