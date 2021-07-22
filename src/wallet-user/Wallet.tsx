import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useLogionChain } from '../logion-chain';
import { AccountData, getAccountData, LOG_DECIMALS } from '../logion-chain/Balances';
import { NormalizedNumber, ScientificNumber, PrefixedNumber, convertToPrefixed } from '../logion-chain/numbers';
import { accountBalance, AssetWithBalance } from '../logion-chain/Assets';

import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';
import Gauge from '../common/Gauge';
import MenuIcon from '../common/MenuIcon';
import Table, { Cell, DateCell, EmptyTableMessage } from '../common/Table';
import Button from '../common/Button';
import Clickable from '../common/Clickable';
import { useRootContext } from '../RootContext';

import { useUserContext } from "./UserContext";

import './Wallet.css';

const ARTIFICIAL_MAX_BALANCE = new ScientificNumber("100", -LOG_DECIMALS);

interface Balances {
    accountId: string,
    balances?: AssetWithBalance[],
}

export default function Account() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();
    const { api } = useLogionChain();
    const [ dataAddress, setDataAddress ] = useState<string | null>(null);
    const [ accountData, setAccountData ] = useState<AccountData | null>(null);
    const [ balance, setBalance ] = useState<PrefixedNumber>(PrefixedNumber.ZERO);
    const [ level, setLevel ] = useState<number>(0);
    const [ assetBalances, setAssetBalances ] = useState<Balances | null>(null);

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

    useEffect(() => {
        if(addresses !== null
            && (assetBalances === null || assetBalances.accountId !== addresses.currentAddress.address)) {

            const accountId = addresses.currentAddress.address;
            setAssetBalances({
                accountId,
            });
            (async function() {
                const balances = await accountBalance({
                    api: api!,
                    accountId,
                });
                setAssetBalances({
                    accountId,
                    balances,
                });
            })();
        }
    }, [ api, assetBalances, addresses, setAssetBalances ]);

    if(addresses === null || selectAddress === null) {
        return null;
    }

    let allAssets = [
        {
            name: "LOG",
            balance: `${balance.coefficient.toFixedPrecision(2)} ${balance.prefix.symbol}LOG`,
            lastTransactionDate: null,
            lastTransactionType: null,
            lastTransactionAmount: null,
        }
    ];
    if(assetBalances !== null && assetBalances.balances !== undefined) {
        const assets = assetBalances.balances
            .filter(assetBalance => !new NormalizedNumber(assetBalance.balance).isZero())
            .map(assetBalance => {
                const balance = new ScientificNumber(assetBalance.balance, 0);
                const prefixedBalance = convertToPrefixed(balance).optimizeScale(3);
                return {
                    name: assetBalance.asset.metadata.name,
                    balance: `${prefixedBalance.coefficient.toFixedPrecision(2)} ${prefixedBalance.prefix.symbol}${assetBalance.asset.metadata.symbol}`,
                    lastTransactionDate: null,
                    lastTransactionType: null,
                    lastTransactionAmount: null,
                };
            });
        allAssets = allAssets.concat(assets);
    }

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
                <Col md={4}>
                    <Frame
                        colors={ colorTheme }
                    >
                        <Gauge
                            title="Current LOG balance"
                            readingIntegerPart={ balance.coefficient.toInteger() }
                            readingDecimalPart={ balance.coefficient.toFixedPrecisionDecimals(2) }
                            unit={ balance.prefix.symbol + "LOG" }
                            level={ level }
                        />
                        <div className="actions">
                            <Clickable>
                                <MenuIcon
                                    icon={{
                                        id: 'send'
                                    }}
                                    background={ colorTheme.topMenuItems.iconGradient }
                                    colorThemeType={ colorTheme.type }
                                />
                            </Clickable>
                            <Clickable>
                                <MenuIcon
                                    icon={{
                                        id: 'receive'
                                    }}
                                    background={ colorTheme.topMenuItems.iconGradient }
                                    colorThemeType={ colorTheme.type }
                                />
                            </Clickable>
                            <Clickable>
                                <MenuIcon
                                    icon={{
                                        id: 'buy'
                                    }}
                                    background={ colorTheme.topMenuItems.iconGradient }
                                    colorThemeType={ colorTheme.type }
                                />
                            </Clickable>
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
                            render: asset => <Cell content={ asset.name } />
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
                            render: asset => <Button colors={ colorTheme.buttons }>More</Button>
                        }
                    ]}
                    data={ allAssets }
                    renderEmpty={ () => <EmptyTableMessage>You have no asset yet</EmptyTableMessage> }
                />
            </Frame>
        </FullWidthPane>
    );
}
