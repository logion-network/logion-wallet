import { useParams } from 'react-router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Transaction } from '@logion/client/dist/TransactionClient.js';
import { CoinBalance } from '@logion/node-api';

import { FullWidthPane } from './Dashboard';
import Frame from './Frame';
import Table, { EmptyTableMessage, Column, DateTimeCell } from './Table';

import { useCommonContext } from './CommonContext';

import WalletGauge from './WalletGauge';

import './Transactions.css';
import TransferAmountCell, { transferBalance, fees } from './TransferAmountCell';
import AmountCell from './AmountCell';
import { TransactionStatusCell, TransactionStatusCellDetails } from "./TransactionStatusCell";
import Loader from './Loader';
import { useResponsiveContext } from './Responsive';
import VaultTransferRequests from './VaultTransferRequests';
import TransactionType from './TransactionType';
import CopyPasteButton from './CopyPasteButton';
import IconTextRow from './IconTextRow';
import Icon from './Icon';
import { useMemo } from 'react';

export type WalletType = "Wallet" | "Vault";

export interface Props {
    address: string,
    balances: CoinBalance[] | null,
    transactions: Transaction[] | null,
    type: WalletType,
    vaultAddress?: string,
}

export default function Transactions(props: Props) {
    const { colorTheme } = useCommonContext();
    const { address, balances, transactions, type, vaultAddress } = props;

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

    const addressTitle = useMemo(() => {
        if(props.type === "Wallet") {
            return "Your address";
        } else {
            return "Your vault address";
        }
    }, [ props.type ]);

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
            render: transaction => <DateTimeCell dateTime={ transaction.createdOn } />,
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
                    <Frame
                        title={ addressTitle }
                    >
                        <Row>
                            <Col>
                                <Row className="content">
                                    <p>
                                    <span>{ props.address }</span>
                                    <CopyPasteButton value={ props.address } className="small" />
                                    </p>
                                </Row>
                            </Col>
                            {
                                props.type === "Vault" &&
                                <Col className="vault-tip">
                                    <IconTextRow
                                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                                        text={ <p>
                                            You can use this Vault public address to transfer assets directly to your Vault.<br />
                                            Once transferred, your assets will be immediately protected by a Legal Officer
                                            signature-based transfer protocol.
                                        </p> }
                                    />
                                </Col>
                            }
                        </Row>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Current balance"
                    >
                        <WalletGauge
                            balance={ balance }
                            vaultAddress={ vaultAddress }
                            sendButton={ type === "Wallet" }
                            sendToVault={ vaultAddress !== undefined }
                            withdrawFromVault={ type === "Vault" && vaultAddress !== undefined }
                        />
                    </Frame>
                </Col>
            </Row>
            { type === "Vault" &&
                <Row>
                    <Col className="requests">
                        <Frame
                            title="Transfer signature request(s)"
                        >
                            <VaultTransferRequests />
                        </Frame>
                    </Col>
                </Row>
            }
            <Row>
                <Col>
                    <Frame className={ `Frame-${ type }` }
                        title="Transaction history"
                    >
                        <Table
                            columns={ columns }
                            data={ transactions }
                            renderEmpty={ () => <EmptyTableMessage>No transaction yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
            </Row>
        </>
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
