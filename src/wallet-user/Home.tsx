import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { Lgnt } from '@logion/node-api';

import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from '../common/Dashboard';
import Icon from '../common/Icon';
import Frame from '../common/Frame';
import Loader from '../common/Loader';
import Table, { DateCell, EmptyTableMessage } from '../common/Table';
import TransferAmountCell, { transferBalance } from '../common/TransferAmountCell';
import AmountCell from '../common/AmountCell';
import Reading from '../common/Reading';
import Button from '../common/Button';
import { TransactionStatusCell } from "../common/TransactionStatusCell";
import NetworkWarning from '../common/NetworkWarning';
import { useLogionChain } from '../logion-chain';

import { SETTINGS_PATH, transactionsPath } from './UserRouter';

import './Home.css';
import TransactionType from 'src/common/TransactionType';
import { useUserContext } from "./UserContext";
import Shortcut from 'src/components/shortcuts/Shortcut';
import Shortcuts from 'src/components/shortcuts/Shortcuts';
import IdentityLocCreation from './IdentityLocCreation';
import LocCreation from './transaction-protection/LocCreation';
import { useMemo } from 'react';
import { COLLECTION_ART_NFT_TEMPLATE_ID, COLLECTION_REAL_ESTATE_TEMPLATE_ID } from 'src/loc/Template';
import { toFeesClass } from "@logion/client/dist/Fees.js";

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

                    <div className="shortcuts">
                        <Frame>
                            <Shortcuts
                                description={ <span>What shall logion <strong>protect</strong> for you?</span> }
                            >
                                <IdentityLocCreation
                                    renderButton={onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_identity"
                                        text={ <span>Identity<br/><span style={{ display: "inline-block" }}></span></span> }
                                    />}
                                />
                                <LocCreation
                                    locType='Collection'
                                    templateId={ COLLECTION_REAL_ESTATE_TEMPLATE_ID }
                                    renderButton={ onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_realestate"
                                        text={ <span>Real Estate<br/> Tokenization</span> }
                                        disabled={ legalOfficersWithValidIdentityLoc?.length === 0 }
                                    /> }
                                />
                                <LocCreation
                                    locType='Collection'
                                    templateId={ COLLECTION_ART_NFT_TEMPLATE_ID }
                                    renderButton={ onClick => <Shortcut
                                        onClick={ onClick }
                                        iconId="shortcut_art"
                                        text={ <span>Art<br/> Tokenization</span> }
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
