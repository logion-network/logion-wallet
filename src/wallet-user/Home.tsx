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
import LegalOfficerName from '../common/LegalOfficerNameCell';
import LocStatusCell from '../common/LocStatusCell';
import ButtonGroup from '../common/ButtonGroup';

import { prefixedLogBalance, SYMBOL } from '../logion-chain/Balances';

import { locDetailsPath, SETTINGS_PATH, TRANSACTION_PROTECTION_PATH, WALLET_PATH } from './UserRouter';
import { TransactionStatusCell } from "../common/TransactionStatusCell";
import './Home.css';
import NetworkWarning from '../common/NetworkWarning';

const MAX_OPEN_LOCS = 3;
const MAX_PENDING_LOCS = 3;

export default function Account() {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={{
                icon: {
                    id: 'home'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            className="UserHome"
        >
            <Content />
        </FullWidthPane>
    );
}

export function Content() {
    const { balances, accounts, transactions, openedLocRequests, pendingLocRequests, nodesDown } = useCommonContext();
    const navigate = useNavigate();

    if(balances === null || transactions === null || accounts === null || openedLocRequests === null || pendingLocRequests === null) {
        return <Loader />;
    }

    return (
        <>
        {
            nodesDown.length > 0 &&
            <Row>
                <Col md={10}>
                    <NetworkWarning settingsPath={ SETTINGS_PATH } />
                </Col>
            </Row>
        }
        <Row>
            <Col
                md={10}
            >
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
                        onClick={ () => navigate(TRANSACTION_PROTECTION_PATH) }
                        slim={true}
                        className="my-transactions"
                    >
                        <Icon icon={{id: "loc"}}/> Go to my transactions
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
                                            "header": "Legal Officer",
                                            render: request => <LegalOfficerName address={ request.ownerAddress } />,
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
                                                        <Button onClick={ () => navigate(locDetailsPath(request.id)) }>View</Button>
                                                    </ButtonGroup>
                                                </ActionCell>
                                            ,
                                            width: '200px',
                                            align: 'center',
                                        },
                                    ]}
                                    data={ openedLocRequests.map(requestAndLoc => requestAndLoc.request).slice(0, MAX_OPEN_LOCS) }
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
                                            header: "Legal officer",
                                            render: request => <LegalOfficerName address={ request.ownerAddress } />,
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
            </Col>
            <Col
                md={2}
                className="character-container"
            >
                <Icon icon={{id: "home-character"}}/>
            </Col>
        </Row>
        </>
    );
}
