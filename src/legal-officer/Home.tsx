import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { Lgnt } from '@logion/node-api';
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from '../common/Dashboard';
import Icon from '../common/Icon';
import Frame from '../common/Frame';
import Loader from '../common/Loader';
import Table, { ActionCell, Cell, DateCell, DateTimeCell, EmptyTableMessage } from '../common/Table';
import TransferAmountCell, { transferBalance } from '../common/TransferAmountCell';
import AmountCell from '../common/AmountCell';
import Reading from '../common/Reading';
import Button from '../common/Button';
import LocStatusCell from '../common/LocStatusCell';
import ButtonGroup from '../common/ButtonGroup';


import { VAULT_OUT_REQUESTS_PATH, dataLocDetailsPath, identityLocDetailsPath, locDetailsPath, locRequestsPath, transactionsPath } from './LegalOfficerPaths';

import './Home.css';
import UserIdentityNameCell from '../common/UserIdentityNameCell';
import { TransactionStatusCell } from "../common/TransactionStatusCell";
import { useLogionChain } from '../logion-chain';
import TransactionType from 'src/common/TransactionType';
import { toFeesClass } from "@logion/client/dist/Fees.js";
import VaultTransferRequestDetails from './vault/VaultTransferDetails';
import VaultTransferRequestStatusCell from 'src/common/VaultTransferRequestStatusCell';
import { useResponsiveContext } from 'src/common/Responsive';

const MAX_WAITING_SHOWN = 3;

export default function Home() {
    const { accounts } = useLogionChain();
    const {
        colorTheme,
        balanceState,
    } = useCommonContext();
    const { locs, locsState, pendingVaultTransferRequests } = useLegalOfficerContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();

    if (!balanceState || accounts === null || locsState === null || locsState.discarded) {
        return <Loader />;
    }

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={ {
                icon: {
                    id: 'home'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="LegalOfficerHome"
        >
            <Row>
                <Col>
                    <Frame
                        title="Last operation and balance"
                    >
                        <Row>
                            <Col>
                                <Table
                                    columns={ [
                                        {
                                            header: "Status",
                                            render: transaction => <TransactionStatusCell
                                                transaction={ transaction } />,
                                            width: "100px",
                                        },
                                        {
                                            header: "Transaction date",
                                            render: transaction => <DateCell dateTime={ transaction.createdOn } />,
                                            width: "200px",
                                        },
                                        {
                                            header: "Transaction type",
                                            render: transaction => <TransactionType address={ accounts.current!.accountId.address } transaction={ transaction } walletType="Wallet" />,
                                        },
                                        {
                                            header: "Amount",
                                            render: transaction => <TransferAmountCell
                                                amount={ transferBalance(accounts!.current!.accountId.address, transaction) } />,
                                            align: 'right',
                                            width: "120px",
                                        },
                                        {
                                            header: "Paid fees",
                                            render: transaction => <AmountCell
                                                amount={ toFeesClass(transaction.fees)?.totalFee || null } />,
                                            align: 'right',
                                            width: "120px",
                                        }
                                    ] }
                                    data={ balanceState.transactions.slice(0, 1) }
                                    renderEmpty={ () => <EmptyTableMessage>No transaction yet</EmptyTableMessage> }
                                />
                            </Col>
                            <Col>
                                <div className="reading-container">
                                    <Reading
                                        readingIntegerPart={ balanceState.balances[0].available.coefficient.toInteger() }
                                        readingDecimalPart={ balanceState.balances[0].available.coefficient.toFixedPrecisionDecimals(2) }
                                        unit={ balanceState.balances[0].available.prefix.symbol + Lgnt.CODE }
                                        level={ balanceState.balances[0].level }
                                    />
                                    <Button
                                        onClick={ () => navigate(transactionsPath("lgnt")) }
                                        slim={ true }
                                    >
                                        <Icon icon={ { id: "wallet" } } /> Go to my wallet
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Frame>

                    <Frame
                        className="identities"
                        title="Last waiting Identity LOC"
                    >
                        <Button
                            onClick={ () => navigate(locRequestsPath('Identity')) }
                            slim={ true }
                            className="identities-button"
                        >
                            <Icon icon={ { id: "identity" } } /> Go to identities
                        </Button>
                        <Table
                            columns={ [
                                {
                                    "header": "Requester",
                                    render: requestAndLoc => <UserIdentityNameCell
                                        userIdentity={ requestAndLoc.data().userIdentity } />,
                                    align: 'left',
                                },
                                {
                                    "header": "Description",
                                    render: requestAndLoc => <Cell content={ requestAndLoc.data().description }
                                                                   overflowing
                                                                   tooltipId='open-id-loc-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.data().status } />,
                                    width: "140px",
                                },
                                {
                                    "header": "Creation date",
                                    render: requestAndLoc => <DateTimeCell
                                        dateTime={ requestAndLoc.data().createdOn || null } />,
                                    width: '200px',
                                    align: 'center',
                                },
                                {
                                    header: "Action",
                                    render: requestAndLoc =>
                                        <ActionCell>
                                            <ButtonGroup>
                                                <Button
                                                    onClick={ () => navigate(identityLocDetailsPath(requestAndLoc.data().id.toString())) }>Manage
                                                    LOC</Button>
                                            </ButtonGroup>
                                        </ActionCell>
                                    ,
                                    width: '200px',
                                    align: 'center',
                                }
                            ] }
                            data={ locs["Identity"].workInProgress.slice(0, MAX_WAITING_SHOWN) }
                            renderEmpty={ () => <EmptyTableMessage>No waiting LOC yet</EmptyTableMessage> }
                        />
                    </Frame>

                    <Frame
                        className="collections"
                        title="Last waiting Collection LOCs"
                    >
                        <Button
                            onClick={ () => navigate(locRequestsPath('Collection')) }
                            slim={ true }
                            className="collections-button"
                        >
                            <Icon icon={ { id: "loc" } } /> Go to collections
                        </Button>
                        <Table
                            columns={ [
                                {
                                    "header": "Requester",
                                    render: requestAndLoc => <UserIdentityNameCell
                                        userIdentity={ requestAndLoc.data().userIdentity } />,
                                    align: 'left',
                                },
                                {
                                    "header": "Description",
                                    render: requestAndLoc => <Cell content={ requestAndLoc.data().description }
                                                                   overflowing
                                                                   tooltipId='open-id-loc-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.data().status } />,
                                    width: "140px",
                                },
                                {
                                    "header": "Creation date",
                                    render: requestAndLoc => <DateTimeCell
                                        dateTime={ requestAndLoc.data().createdOn || null } />,
                                    width: '200px',
                                    align: 'center',
                                },
                                {
                                    header: "Action",
                                    render: requestAndLoc =>
                                        <ActionCell>
                                            <ButtonGroup>
                                                <Button
                                                    onClick={ () => navigate(locDetailsPath(requestAndLoc.data().id.toString(), "Collection")) }>Manage
                                                    LOC</Button>
                                            </ButtonGroup>
                                        </ActionCell>
                                    ,
                                    width: '200px',
                                    align: 'center',
                                }
                            ] }
                            data={ locs["Collection"].workInProgress.slice(0, MAX_WAITING_SHOWN) }
                            renderEmpty={ () => <EmptyTableMessage>No waiting LOC yet</EmptyTableMessage> }
                        />
                    </Frame>

                    <Frame
                        className="transactions"
                        title="Last waiting Transaction LOC"
                    >
                        <Button
                            onClick={ () => navigate(locRequestsPath('Transaction')) }
                            slim={ true }
                            className="transactions-button"
                        >
                            <Icon icon={ { id: "loc" } } /> Go to transactions
                        </Button>
                        <Table
                            columns={ [
                                {
                                    "header": "Requester",
                                    render: requestAndLoc => <UserIdentityNameCell
                                        userIdentity={ requestAndLoc.data().userIdentity } />,
                                    align: 'left',
                                },
                                {
                                    "header": "Description",
                                    render: requestAndLoc => <Cell content={ requestAndLoc.data().description }
                                                                   overflowing
                                                                   tooltipId='open-loc-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.data().status } />,
                                    width: "140px",
                                },
                                {
                                    "header": "Creation date",
                                    render: requestAndLoc => <DateTimeCell
                                        dateTime={ requestAndLoc.data().createdOn || null } />,
                                    width: '200px',
                                    align: 'center',
                                },
                                {
                                    header: "Action",
                                    render: requestAndLoc =>
                                        <ActionCell>
                                            <ButtonGroup>
                                                <Button
                                                    onClick={ () => navigate(dataLocDetailsPath(requestAndLoc.data().locType, requestAndLoc.data().id.toString())) }>Manage
                                                    LOC</Button>
                                            </ButtonGroup>
                                        </ActionCell>
                                    ,
                                    width: '200px',
                                    align: 'center',
                                }
                            ] }
                            data={ locs['Transaction'].workInProgress.slice(0, MAX_WAITING_SHOWN) }
                            renderEmpty={ () => <EmptyTableMessage>No waiting LOC yet</EmptyTableMessage> }
                        />
                    </Frame>

                    <Frame
                        className="withdrawals"
                        title="Last waiting vault withdrawals"
                    >
                        <Button
                            onClick={ () => navigate(VAULT_OUT_REQUESTS_PATH) }
                            slim={ true }
                            className="withdrawals-button"
                        >
                            <Icon icon={ { id: "vault" } } /> Go to vault withdrawals
                        </Button>
                        <Table
                            columns={ [
                                {
                                    header: "User",
                                    render: request => <UserIdentityNameCell userIdentity={ request.requesterIdentity } />,
                                    align: "left",
                                    renderDetails: request => <VaultTransferRequestDetails request={ request }/>
                                },
                                {
                                    header: "Type",
                                    render: () => <Cell content={`${Lgnt.CODE}`} />,
                                    width: '80px',
                                },
                                {
                                    header: "Amount",
                                    render: request => <AmountCell amount={ Lgnt.fromCanonical(BigInt(request.amount)) } />,
                                    align: 'right',
                                    width: width({
                                        onSmallScreen: "100px",
                                        otherwise: "120px"
                                    }),
                                },
                                {
                                    header: "Status",
                                    render: request => <VaultTransferRequestStatusCell status={ request.status } viewer="Legal Officer" />,
                                    width: '150px',
                                },
                                {
                                    header: "Creation date",
                                    render: request => <DateTimeCell dateTime={ request.createdOn } />,
                                    width: '130px',
                                },
                            ] }
                            data={ pendingVaultTransferRequests?.slice(0, MAX_WAITING_SHOWN) || [] }
                            renderEmpty={ () => <EmptyTableMessage>No waiting withdrawal requests</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
