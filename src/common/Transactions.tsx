import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Transaction } from '@logion/client';
import { TypesAccountData, ValidAccountId } from '@logion/node-api';

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
    account?: ValidAccountId,
    balance: TypesAccountData | null,
    transactions: Transaction[] | null,
    type: WalletType,
    vaultAddress?: ValidAccountId,
}

export default function Transactions(props: Props) {
    const { colorTheme } = useCommonContext();
    const { account, balance, transactions, type, vaultAddress } = props;

    if (balance === null || transactions === null) {
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
            <Content account={ account } balance={ balance } transactions={ transactions } type={ type } vaultAccount={ vaultAddress }/>
        </FullWidthPane>
    );
}

interface ContentProps {
    account?: ValidAccountId,
    balance: TypesAccountData,
    transactions: Transaction[],
    type: WalletType,
    vaultAccount?: ValidAccountId,
}

function Content(props: ContentProps) {
    const { account, balance, transactions, type, vaultAccount } = props;
    const { width } = useResponsiveContext();

    const addressTitle = useMemo(() => {
        if(props.type === "Wallet") {
            return "Your address";
        } else {
            return "Your vault address";
        }
    }, [ props.type ]);

    if (balance === null || transactions === null) {
        return <Loader />;
    }

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
                                               to={ transaction.to || null } />,
        },
        {
            header: "Transaction type",
            render: transaction => <TransactionType transaction={ transaction } walletType={ props.type } account={ props.account } vaultAccount={ props.vaultAccount } />,
            width: width({
                onSmallScreen: "180px",
                otherwise: "250px"
            }),
        },
        {
            header: "Amount",
            render: transaction => <TransferAmountCell amount={ transferBalance(account, transaction) } />,
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
            render: transaction => <AmountCell amount={ fees(account, transaction) } />,
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
                                    <span>{ props.account?.address || "" }</span>
                                    <CopyPasteButton value={ props.account?.address || "" } className="small" />
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
                            vaultAccount={ vaultAccount }
                            sendButton={ type === "Wallet" }
                            sendToVault={ vaultAccount !== undefined }
                            withdrawFromVault={ type === "Vault" && vaultAccount !== undefined }
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
    from: ValidAccountId,
    to: ValidAccountId | null,
}

function FromToCell(props: FromToCellProps) {
    return (
        <div className="from-to-cell">
            <OverlayTrigger
              placement="bottom"
              delay={ 500 }
              overlay={
                <Tooltip id={`tooltip-${props.from.address}`}>
                  { props.from.address }
                </Tooltip>
              }
            >
                <span className="from">{ props.from.address }</span>
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              delay={ 500 }
              overlay={
                <Tooltip id={`tooltip-${props.to?.address}`}>
                  { props.to?.address }
                </Tooltip>
              }
            >
                <span className="to">{ props.to !== null ? props.to.address : "-" }</span>
            </OverlayTrigger>
        </div>
    );
}
