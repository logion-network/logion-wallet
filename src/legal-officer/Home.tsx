import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { prefixedLogBalance, SYMBOL } from '@logion/node-api';
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


import { WALLET_PATH, dataLocDetailsPath, identityLocDetailsPath, locRequestsPath } from './LegalOfficerPaths';

import './Home.css';
import UserIdentityNameCell from '../common/UserIdentityNameCell';
import LocRequestDetails from './transaction-protection/LocRequestDetails';
import { TransactionStatusCell } from "../common/TransactionStatusCell";
import { useLogionChain } from '../logion-chain';
import TransactionType from 'src/common/TransactionType';

const MAX_OPEN_LOCS = 3;
const MAX_PENDING_LOCS = 3;

export default function Account() {
    const { accounts } = useLogionChain();
    const {
        colorTheme,
        balanceState,
    } = useCommonContext();
    const {
        openedLocRequests,
        pendingLocRequests,
        openedIdentityLocs
    } = useLegalOfficerContext();
    const navigate = useNavigate();

    if (!balanceState || accounts === null || openedLocRequests === null || pendingLocRequests === null || openedIdentityLocs === null) {
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
                                                amount={ prefixedLogBalance(transaction.fees.total) } />,
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
                                        readingIntegerPart={ balanceState.balances[0].balance.coefficient.toInteger() }
                                        readingDecimalPart={ balanceState.balances[0].balance.coefficient.toFixedPrecisionDecimals(2) }
                                        unit={ balanceState.balances[0].balance.prefix.symbol + SYMBOL }
                                        level={ balanceState.balances[0].level }
                                    />
                                    <Button
                                        onClick={ () => navigate(WALLET_PATH) }
                                        slim={ true }
                                    >
                                        <Icon icon={ { id: "wallet" } } /> Go to my wallet
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Frame>

                    <Frame
                        className="transactions"
                        title="Last open Transaction LOC"
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
                            data={ openedLocRequests['Transaction'].slice(0, MAX_OPEN_LOCS) }
                            renderEmpty={ () => <EmptyTableMessage>No open LOC yet</EmptyTableMessage> }
                        />
                    </Frame>
                    <Frame
                        className="transactions"
                        title="Last Transaction LOC requests"
                    >
                        <Table
                            columns={ [
                                {
                                    header: "Requester",
                                    render: request => <UserIdentityNameCell userIdentity={ request.data().userIdentity } />,
                                    align: "left",
                                    renderDetails: request => <LocRequestDetails request={ request.data() } />
                                },
                                {
                                    "header": "Description",
                                    render: request => <Cell content={ request.data().description } overflowing
                                                             tooltipId='loc-request-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: request => <LocStatusCell status={ request.data().status } />,
                                    width: "140px",
                                },
                                {
                                    header: "Creation date",
                                    render: request => <DateTimeCell dateTime={ request.data().createdOn || null } />,
                                    width: '200px',
                                    align: 'center',
                                }
                            ] }
                            data={ pendingLocRequests['Transaction'].slice(0, MAX_PENDING_LOCS) }
                            renderEmpty={ () => <EmptyTableMessage>No requested LOC yet</EmptyTableMessage> }
                        />
                    </Frame>
                    <Frame
                        className="identities"
                        title="Last open Identity LOC"
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
                            data={ openedIdentityLocs.slice(0, MAX_OPEN_LOCS) }
                            renderEmpty={ () => <EmptyTableMessage>No open LOC yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
