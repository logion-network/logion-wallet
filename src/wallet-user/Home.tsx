import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { prefixedLogBalance, SYMBOL } from '@logion/node-api/dist/Balances';

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
import LegalOfficerName from '../common/LegalOfficerNameCell';
import LocStatusCell from '../common/LocStatusCell';
import ButtonGroup from '../common/ButtonGroup';
import { TransactionStatusCell } from "../common/TransactionStatusCell";
import NetworkWarning from '../common/NetworkWarning';
import { useResponsiveContext } from '../common/Responsive';
import { useLogionChain } from '../logion-chain';

import { SETTINGS_PATH, WALLET_PATH, dataLocDetailsPath, locRequestsPath } from './UserRouter';

import './Home.css';
import TransactionType from 'src/common/TransactionType';
import { useUserContext } from "./UserContext";

const MAX_OPEN_LOCS = 3;
const MAX_PENDING_LOCS = 3;

export default function Account() {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={ {
                icon: {
                    id: 'home'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="UserHome"
        >
            <Content />
        </FullWidthPane>
    );
}

export function Content() {
    const { accounts } = useLogionChain();
    const { balanceState, nodesDown } = useCommonContext();
    const { locsState } = useUserContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();

    if (!balanceState || !(accounts?.current?.address) || locsState === undefined) {
        return <Loader />;
    }

    return (
        <>
            {
                nodesDown.length > 0 &&
                <Row>
                    <Col md={ 10 }>
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    </Col>
                </Row>
            }
            <Row>
                <Col
                    md={ 10 }
                >
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
                                            render: transaction => <TransactionType address={ accounts.current!.address } transaction={ transaction } walletType="Wallet" />,
                                        },
                                        {
                                            header: "Amount",
                                            render: transaction => <TransferAmountCell
                                                amount={ transferBalance(accounts!.current!.address, transaction) } />,
                                            align: 'right',
                                            width: "120px",
                                        },
                                        {
                                            header: "Paid fees",
                                            render: transaction => <AmountCell
                                                amount={ prefixedLogBalance(transaction.fee) } />,
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
                            className="my-transactions"
                        >
                            <Icon icon={ { id: "loc" } } /> Go to my transactions
                        </Button>
                        <Table
                            columns={ [
                                {
                                    "header": "Legal Officer",
                                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
                                    align: 'left',
                                },
                                {
                                    "header": "Description",
                                    render: request => <Cell content={ request.description }
                                                             overflowing
                                                             tooltipId='open-loc-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: request => <LocStatusCell status={ request.status } />,
                                    width: "140px",
                                },
                                {
                                    "header": "Creation date",
                                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                                    width: width({
                                        onSmallScreen: "150px",
                                        otherwise: "200px"
                                    }),
                                    align: 'center',
                                },
                                {
                                    header: "Action",
                                    render: request =>
                                        <ActionCell>
                                            <ButtonGroup>
                                                <Button
                                                    onClick={ () => navigate(dataLocDetailsPath(request.locType, request.id)) }>View</Button>
                                            </ButtonGroup>
                                        </ActionCell>
                                    ,
                                    width: width({
                                        onSmallScreen: "100px",
                                        otherwise: "200px"
                                    }),
                                    align: 'center',
                                },
                            ] }
                            data={ locsState.openLocs['Transaction'].map(locState => locState.data()).slice(0, MAX_OPEN_LOCS) }
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
                                    header: "Legal officer",
                                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
                                    align: 'left',
                                },
                                {
                                    "header": "Description",
                                    render: request => <Cell content={ request.description } overflowing
                                                             tooltipId='loc-request-description-tooltip' />,
                                    align: 'left',
                                },
                                {
                                    header: "Status",
                                    render: request => <LocStatusCell status={ request.status } />,
                                    width: "140px",
                                },
                                {
                                    header: "Creation date",
                                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                                    width: '200px',
                                    align: 'center',
                                }
                            ] }
                            data={ locsState.pendingRequests['Transaction'].map(locsState => locsState.data()).slice(0, MAX_PENDING_LOCS) }
                            renderEmpty={ () => <EmptyTableMessage>No requested LOC yet</EmptyTableMessage> }
                        />
                    </Frame>
                </Col>
                <Col
                    md={ 2 }
                    className="character-container"
                >
                    <Icon icon={ { id: "home-character" } } />
                </Col>
            </Row>
        </>
    );
}
