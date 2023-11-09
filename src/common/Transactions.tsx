import { useParams, useNavigate } from 'react-router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Transaction } from '@logion/client/dist/TransactionClient.js';
import { Coin, CoinBalance } from '@logion/node-api';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Table, { DateCell, EmptyTableMessage, Column } from './Table';

import { useCommonContext } from './CommonContext';

import WalletGauge from './WalletGauge';

import './Transactions.css';
import TransferAmountCell, { transferBalance, fees } from './TransferAmountCell';
import AmountCell from './AmountCell';
import { TransactionStatusCell, TransactionStatusCellDetails } from "./TransactionStatusCell";
import Loader from './Loader';
import { useResponsiveContext } from './Responsive';
import { WalletType } from "./Wallet";
import VaultOutRequest from "../vault/VaultOutRequest";
import VaultTransferRequests from './VaultTransferRequests';
import TransactionType from './TransactionType';
import CoinName from 'src/components/coin/CoinName';
import CoinIcon from 'src/components/coin/CoinIcon';

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
    const columns: Column<Transaction>[] = [
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
            render: transaction => <TransactionType transaction={ transaction } walletType={ props.type } address={ props.address } vaultAddress={ props.vaultAddress } />,
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
    ];

    if(props.type === 'Wallet') {
        columns.push({
            header: "Paid fees",
            render: transaction => <AmountCell amount={ fees(address, transaction) } />,
            align: 'right',
            width: width({
                onSmallScreen: "80px",
                otherwise: "120px"
            }),
        });
    }

    return (
        <>
            <Row>
                <Col>
                    <Frame className={ `Frame-${ type }` }
                        title={ <TransactionsFrameTitle coin={ balance.coin } vaultOutButton={ type === "Vault" }/> }
                    >
                        <Table
                            columns={ columns }
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
                                balance={ balance }
                                type='linear'
                                vaultAddress={ vaultAddress }
                            />
                        </Frame>
                    </Col>
                </Row>
            }
            { type === "Vault" &&
                <Row>
                    <Col className="col-xxxl-8 requests">
                        <Frame
                            fillHeight
                            title="Transfer signature request(s)"
                        >
                            <VaultTransferRequests />
                        </Frame>
                    </Col>
                    <Col className="col-xxxl-4">
                        <Frame
                            fillHeight
                            title={
                                <div className="gauge-title">
                                    <CoinIcon coinId={ balance.coin.id } height="72px" />
                                    <span>Current <CoinName coinId={ balance.coin.id }/> balance</span>
                                </div>
                            }
                            className="gauge-container"
                        >
                            <WalletGauge
                                balance={ balance }
                                type='arc'
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
                    Transaction history: <CoinIcon
                        coinId={ props.coin.id }
                        height="36px"
                    /> <CoinName coinId={ props.coin.id }/> ({ props.coin.symbol })
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
