import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from '../../common/Dashboard';
import Icon from '../../common/Icon';
import Frame from '../../common/Frame';
import Loader from '../../common/Loader';
import Table, { DateCell, EmptyTableMessage } from '../../common/Table';
import TransferAmountCell, { transferBalance } from '../../common/TransferAmountCell';
import AmountCell from '../../common/AmountCell';
import Button from '../../common/Button';
import { TransactionStatusCell } from "../../common/TransactionStatusCell";
import NetworkWarning from '../../common/NetworkWarning';
import { useLogionChain } from '../../logion-chain';

import { SETTINGS_PATH, TRANSACTIONS_PATH } from '../UserPaths';

import './Home.css';
import TransactionType from '../../common/TransactionType';
import { useUserContext } from "../UserContext";
import Shortcut from '../../components/shortcuts/Shortcut';
import Shortcuts from '../../components/shortcuts/Shortcuts';
import LocRequestButton from '../../components/locrequest/LocRequestButton';
import { useMemo } from 'react';
import { toFeesClass } from "@logion/client/dist/Fees.js";
import BalanceReading from 'src/common/BalanceReading';

export default function Home() {
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

    const legalOfficersWithValidIdentityLoc = useMemo(
        () => (locsState && !locsState.discarded) ? locsState.legalOfficersWithValidIdentityLoc : undefined,
        [ locsState ]
    );

    if (!balanceState || !(accounts?.current?.accountId) || locsState === undefined) {
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
                                            render: transaction => <TransactionType account={ accounts.current!.accountId } transaction={ transaction } walletType="Wallet" />,
                                        },
                                        {
                                            header: "Amount",
                                            render: transaction => <TransferAmountCell
                                                amount={ transferBalance(accounts!.current!.accountId, transaction) } />,
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
                                    <BalanceReading
                                        balance={ balanceState.balance }
                                    />
                                    <Button
                                        onClick={ () => navigate(TRANSACTIONS_PATH) }
                                        slim={ true }
                                    >
                                        <Icon icon={ { id: "wallet" } } /> Go to my wallet
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Frame>

                    <div className="shortcuts">
                        <Frame>
                            <Shortcuts
                                description={ <span>What shall logion <strong>protect</strong> for you?</span> }
                            >
                                <LocRequestButton
                                    locType="Identity"
                                    renderButton={onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_identity"
                                        text={ <span>Identity<br/><span style={{ display: "inline-block" }}></span></span> }
                                    />}
                                />
                                <LocRequestButton
                                    locType="Collection"
                                    renderButton={ onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_realestate"
                                        text={ <span>Collection<br/><span style={{ display: "inline-block" }}></span></span> }
                                        disabled={ legalOfficersWithValidIdentityLoc?.length === 0 }
                                    /> }
                                />
                                <LocRequestButton
                                    locType="Transaction"
                                    renderButton={ onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_art"
                                        text={ <span>Transaction<br/><span style={{ display: "inline-block" }}></span></span> }
                                        disabled={ legalOfficersWithValidIdentityLoc?.length === 0 }
                                    /> }
                                />
                            </Shortcuts>
                        </Frame>
                        <div className="shortcuts-character-container">
                            <Icon icon={ { id: "shortcuts-character" } }/>
                        </div>
                    </div>
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
