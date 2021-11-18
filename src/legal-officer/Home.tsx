import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';

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
import Tabs from '../common/Tabs';
import LocStatusCell from '../common/LocStatusCell';
import ButtonGroup from '../common/ButtonGroup';

import { prefixedLogBalance, SYMBOL } from '../logion-chain/Balances';

import { IDENTITIES_PATH, WALLET_PATH, locDetailsPath, LOC_REQUESTS_PATH } from './LegalOfficerPaths';

import './Home.css';
import UserIdentityNameCell from '../common/UserIdentityNameCell';
import LocRequestDetails from './transaction-protection/LocRequestDetails';
import { TransactionStatusCell } from "../common/TransactionStatusCell";

const MAX_OPEN_LOCS = 3;
const MAX_PENDING_LOCS = 3;

export default function Account() {
    const { colorTheme, balances, accounts, transactions, openedLocRequests, pendingLocRequests, openedIdentityLocs } = useCommonContext();
    const navigate = useNavigate();

    if(balances === null || transactions === null || accounts === null || openedLocRequests === null || pendingLocRequests === null || openedIdentityLocs === null) {
        return <Loader />;
    }

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            className="Home"
        >
            <Row>
                <Col>
                    <Frame
                        title="Last operation and balance"
                    >
                        <Row>
                            <Col>
                                <Table
                                    columns={[
                                        {
                                            header: "Status",
                                            render: transaction => <TransactionStatusCell transaction={ transaction } />,
                                            width: "100px",
                                        },
                                        {
                                            header: "Transaction date",
                                            render: transaction => <DateCell dateTime={ transaction.createdOn } />,
                                            width: "200px",
                                        },
                                        {
                                            header: "Transaction type",
                                            render: transaction => <Cell content={ transaction.type } />
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
                                        }
                                    ]}
                                    data={ transactions.slice(0, 1) }
                                    renderEmpty={ () => <EmptyTableMessage>No transaction yet</EmptyTableMessage> }
                                />
                            </Col>
                            <Col>
                                <div className="reading-container">
                                    <Reading
                                        readingIntegerPart={ balances[0].balance.coefficient.toInteger() }
                                        readingDecimalPart={ balances[0].balance.coefficient.toFixedPrecisionDecimals(2) }
                                        unit={ balances[0].balance.prefix.symbol + SYMBOL }
                                        level={ balances[0].level }
                                    />
                                    <Button
                                        onClick={ () => navigate(WALLET_PATH) }
                                        slim={true}
                                    >
                                        <Icon icon={{id: "wallet"}}/> Go to my wallet
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Frame>

                    <Frame
                        className="transactions"
                    >
                        <Button
                            onClick={ () => navigate(LOC_REQUESTS_PATH) }
                            slim={true}
                            className="transactions-button"
                        >
                            <Icon icon={{id: "loc"}}/> Go to transactions
                        </Button>
                        <Tabs
                            className="open-transactions"
                            activeKey="open"
                            tabs={[
                                {
                                    key: "open",
                                    title: "Three latest open Transaction Protection Case(s)",
                                    render: () => <Table
                                        columns={[
                                            {
                                                "header": "Requester",
                                                render: request => <UserIdentityNameCell userIdentity={ request.userIdentity }/>,
                                                align: 'left',
                                            },
                                            {
                                                "header": "Description",
                                                render: request => <Cell content={ request.description } />,
                                                align: 'left',
                                            },
                                            {
                                                header: "Status",
                                                render: request => <LocStatusCell status={ request.status }/>,
                                                width: "140px",
                                            },
                                            {
                                                "header": "Creation date",
                                                render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                                                width: '200px',
                                                align: 'center',
                                            },
                                            {
                                                header: "Action",
                                                render: request =>
                                                    <ActionCell>
                                                        <ButtonGroup>
                                                            <Button onClick={ () => navigate(locDetailsPath(request.id)) }>Manage LOC</Button>
                                                        </ButtonGroup>
                                                    </ActionCell>
                                                ,
                                                width: '200px',
                                                align: 'center',
                                            }
                                        ]}
                                        data={ openedLocRequests.filter(request => request.locType === "Transaction").slice(0, MAX_OPEN_LOCS) }
                                        renderEmpty={ () => <EmptyTableMessage>No open LOC yet</EmptyTableMessage>}
                                    />
                                }
                            ]}
                            onSelect={ () => {} }
                        />
                        <Tabs
                            className="pending-transactions"
                            activeKey="pending"
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Three latest pending Transaction Protection Case(s)",
                                    render: () => <Table
                                        columns={[
                                            {
                                                header: "Requester",
                                                render: request => <UserIdentityNameCell userIdentity={ request.userIdentity } />,
                                                align: "left",
                                                renderDetails: request => <LocRequestDetails request={ request }/>
                                            },
                                            {
                                                "header": "Description",
                                                render: request => <Cell content={ request.description } />,
                                                align: 'left',
                                            },
                                            {
                                                header: "Status",
                                                render: request => <LocStatusCell status={ request.status }/>,
                                                width: "140px",
                                            },
                                            {
                                                header: "Creation date",
                                                render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                                                width: '200px',
                                                align: 'center',
                                            }
                                        ]}
                                        data={ pendingLocRequests.slice(0, MAX_PENDING_LOCS) }
                                        renderEmpty={ () => <EmptyTableMessage>No requested LOC yet</EmptyTableMessage> }
                                    />
                                }
                            ]}
                            onSelect={ () => {} }
                        />
                    </Frame>
                    <Frame className="identities">
                        <Button
                            onClick={ () => navigate(IDENTITIES_PATH) }
                            slim={true}
                            className="identities-button"
                        >
                            <Icon icon={{id: "identity"}}/> Go to identities
                        </Button>
                        <Tabs
                            className="open-identities"
                            activeKey="open"
                            tabs={[
                                {
                                    key: "open",
                                    title: "Three latest open Identity Protection Case(s)",
                                    render: () => <Table
                                        columns={[
                                            {
                                                "header": "Requester",
                                                render: request => <UserIdentityNameCell userIdentity={ request.userIdentity }/>,
                                                align: 'left',
                                            },
                                            {
                                                "header": "Description",
                                                render: request => <Cell content={ request.description } />,
                                                align: 'left',
                                            },
                                            {
                                                header: "Status",
                                                render: request => <LocStatusCell status={ request.status }/>,
                                                width: "140px",
                                            },
                                            {
                                                "header": "Creation date",
                                                render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                                                width: '200px',
                                                align: 'center',
                                            },
                                            {
                                                header: "Action",
                                                render: request =>
                                                    <ActionCell>
                                                        <ButtonGroup>
                                                            <Button onClick={ () => navigate(locDetailsPath(request.id)) }>Manage LOC</Button>
                                                        </ButtonGroup>
                                                    </ActionCell>
                                                ,
                                                width: '200px',
                                                align: 'center',
                                            }
                                        ]}
                                        data={ openedIdentityLocs.slice(0, MAX_OPEN_LOCS) }
                                        renderEmpty={ () => <EmptyTableMessage>No open LOC yet</EmptyTableMessage>}
                                    />
                                }
                            ]}
                            onSelect={ () => {} }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
