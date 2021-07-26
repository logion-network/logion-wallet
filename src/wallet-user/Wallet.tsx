import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useLogionChain } from '../logion-chain';
import { AccountData, getAccountData, LOG_DECIMALS } from '../logion-chain/Balances';
import { ScientificNumber, PrefixedNumber, convertToPrefixed } from '../logion-chain/numbers';

import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';
import Gauge from '../common/Gauge';
import Table, { Cell, DateCell, EmptyTableMessage, ActionCell } from '../common/Table';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { useRootContext } from '../RootContext';

import { useUserContext } from "./UserContext";

import './Wallet.css';

const ARTIFICIAL_MAX_BALANCE = new ScientificNumber("100", -LOG_DECIMALS);

export default function Account() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();
    const { api } = useLogionChain();
    const [ dataAddress, setDataAddress ] = useState<string | null>(null);
    const [ accountData, setAccountData ] = useState<AccountData | null>(null);
    const [ balance, setBalance ] = useState<PrefixedNumber>(PrefixedNumber.ZERO);
    const [ level, setLevel ] = useState<number>(0);

    useEffect(() => {
        if(addresses !== null
            && (accountData === null || addresses.currentAddress.address !== dataAddress)) {
            setDataAddress(addresses.currentAddress.address);
            setBalance(PrefixedNumber.ZERO);
            setLevel(0);
            (async function() {
                const data = await getAccountData({
                    api: api!,
                    accountId: addresses.currentAddress.address,
                });
                setAccountData(data);
                const available = new ScientificNumber(data.available, -LOG_DECIMALS).optimizeScale(3);
                setBalance(convertToPrefixed(available));
                setLevel(available.divideBy(ARTIFICIAL_MAX_BALANCE).toNumber());
            })();
        }
    }, [ accountData, addresses, api, dataAddress ]);

    if(addresses === null || selectAddress === null) {
        return null;
    }

    let allAssets: Asset[] = [
        {
            name: "Logion",
            iconId: 'log',
            balance: `${balance.coefficient.toFixedPrecision(2)}`,
            symbol: `${balance.prefix.symbol}LOG`,
            lastTransactionDate: null,
            lastTransactionType: null,
            lastTransactionAmount: null,
        },
        {
            name: "Polkadot",
            iconId: 'dot',
            balance: `0.00`,
            symbol: "DOT",
            lastTransactionDate: null,
            lastTransactionType: null,
            lastTransactionAmount: null,
        }
    ];

    return (
        <FullWidthPane
            className="Wallet"
            mainTitle="Wallet"
            titleIcon={{
                icon: {
                    id: 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Row>
                <Col md={8}>
                    <Frame
                        colors={ colorTheme }
                        title="Balance per month"
                    >
                        <img
                            className="fake-graph"
                            src={ `${process.env.PUBLIC_URL}/assets/fake_balance_history.png` }
                            alt="Fake balance graph"
                        />
                    </Frame>
                </Col>
                <Col md={4}>
                    <Frame
                        colors={ colorTheme }
                        fillHeight
                    >
                        <Gauge
                            title="Current LOG balance"
                            readingIntegerPart={ balance.coefficient.toInteger() }
                            readingDecimalPart={ balance.coefficient.toFixedPrecisionDecimals(2) }
                            unit={ balance.prefix.symbol + "LOG" }
                            level={ level }
                        />
                        <div className="actions">
                            <Button colors={ colorTheme.buttons } slim><Icon icon={{id:'send'}} /> Send</Button>
                            <Button colors={ colorTheme.buttons } slim><Icon icon={{id:'buy'}} /> Buy</Button>
                        </div>
                    </Frame>
                </Col>
            </Row>
            <Frame
                className="assets"
                colors={ colorTheme }
            >
                <h2>Asset balances</h2>

                <Table
                    colorTheme={ colorTheme }
                    columns={[
                        {
                            header: "Asset name",
                            render: asset => <AssetNameCell asset={ asset } />
                        },
                        {
                            header: "Balance",
                            render: asset => <Cell content={ asset.balance } align="right"/>,
                            width: "150px",
                        },
                        {
                            header: "Last transaction date",
                            render: asset => <DateCell dateTime={ asset.lastTransactionDate } />
                        },
                        {
                            header: "Last transaction type",
                            render: asset => <Cell content={ asset.lastTransactionType } align="center"/>
                        },
                        {
                            header: "Last transaction amount",
                            render: asset => <Cell content={ asset.lastTransactionAmount } align="right"/>
                        },
                        {
                            header: "",
                            render: asset => asset.symbol !== 'DOT' ? <ActionCell><Button colors={ colorTheme.buttons }>More</Button></ActionCell> : <NotAvailable/>,
                            width: "200px",
                        }
                    ]}
                    data={ allAssets }
                    renderEmpty={ () => <EmptyTableMessage>You have no asset yet</EmptyTableMessage> }
                />
            </Frame>
        </FullWidthPane>
    );
}

interface Asset {
    name: string,
    iconId: string,
    balance: string,
    symbol: string,
    lastTransactionDate: string | null,
    lastTransactionType: string | null,
    lastTransactionAmount: string | null,
}

interface AssetNameCellProps {
    asset: Asset,
}

function AssetNameCell(props: AssetNameCellProps) {

    return (
        <div className="asset-name-cell">
            <Icon icon={{id: props.asset.iconId}} type="png" />
            <span className="name">{ props.asset.name } ({ props.asset.symbol })</span>
        </div>
    );
}

function NotAvailable() {

    return (
        <div className="not-available">
            <span>Not available (yet)</span>
        </div>
    );
}
