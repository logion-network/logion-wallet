import React, { useState, useEffect } from 'react';
import BN from 'bn.js';

import { useLogionChain } from '../../logion-chain';
import { assetBalance } from '../../logion-chain/Assets';

import { useRootContext } from '../../RootContext';
import { FullWidthPane } from '../../component/Dashboard';
import Tabs from '../../component/Tabs';
import Table, { Cell, EmptyTableMessage } from '../../component/Table';
import { ColorThemeType, GREEN } from '../../component/ColorTheme';

import { useUserContext } from '../UserContext';
import { getOfficer } from "./Model";
import Icon from '../../component/Icon';

import './RecoveryProcess.css';
import { TokenizationRequest } from '../../legal-officer/Types';

interface EnrichedRequests {
    requests: TokenizationRequest[],
    querying: boolean,
    balances?: Record<string, string>,
}

interface TabTitleProps {
    iconId: string,
    colorThemeType: ColorThemeType,
    title: string,
    size: number,
}

function TabTitle(props: TabTitleProps) {

    return (
        <div className="recovery-tab-title">
            <Icon icon={{id: props.iconId}} colorThemeType={ props.colorThemeType }/>
            <span className="title">{ props.title }</span>
            <span className="size">{ props.size }</span>
        </div>
    );
}

export default function GoToTrustProtection() {
    const { api } = useLogionChain();
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme, recoveredAddress, recoveredTokenizationRequests } = useUserContext();
    const [ tabKey, setTabKey ] = useState<string>('tokens');
    const [ requests, setRequests ] = useState<EnrichedRequests | null>(null);

    useEffect(() => {
        if(recoveredTokenizationRequests !== null
                && (requests === null || recoveredTokenizationRequests !== requests!.requests)) {
            setRequests({
                requests: recoveredTokenizationRequests,
                querying: false
            });
        }
    }, [ recoveredTokenizationRequests, requests, setRequests ]);

    useEffect(() => {
        if(api !== null && requests !== null && !requests.querying && requests.balances === undefined) {
            setRequests({
                requests: requests.requests,
                querying: true
            });
            (async function() {
                const balancesArray = await Promise.all(requests.requests.map(
                    request => assetBalance({
                        api,
                        assetId: new BN(request.assetDescription!.assetId),
                        decimals: request.assetDescription!.decimals,
                        address: recoveredAddress!,
                    })
                ));
                const balances: Record<string, string> = {};
                for(let i = 0; i < balancesArray.length; ++i) {
                    balances[requests.requests[i].assetDescription!.assetId] = balancesArray[i];
                }
                setRequests({
                    requests: requests.requests,
                    querying: false,
                    balances,
                });
            })();
        }
    }, [ api, requests, setRequests, recoveredAddress ]);

    if(addresses === null || selectAddress === null || recoveredAddress === null || recoveredTokenizationRequests === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryProcess"
            mainTitle="Recovery Process"
            titleIcon={{
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.recoveryItems.iconGradient,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <>
                <div
                    className="alert-activated"
                    style={{
                        color: GREEN,
                        borderColor: GREEN,
                    }}
                >
                    <Icon
                        colorThemeType={ colorTheme.type }
                        icon={{id: 'accepted'}}
                    /> Your Logion Trust Protection is active and you are now ready to transfer assets
                    from recovered address { recoveredAddress }.
                </div>
                <Tabs
                    activeKey={ tabKey }
                    tabs={[
                        {
                            key: "tokens",
                            title: (
                                <TabTitle
                                    iconId="tokens"
                                    colorThemeType={ colorTheme.type }
                                    title="Tokens"
                                    size={ recoveredTokenizationRequests.length }
                                />
                            ),
                            render: () => (
                                    <Table
                                        columns={[
                                            {
                                                header: "Name",
                                                render: request => <Cell content={ request.requestedTokenName } />,
                                                width: "150px",
                                            },
                                            {
                                                header: "Description",
                                                render: request => <Cell content={ `${request.bars} gold bar(s)` } />,
                                            },
                                            {
                                                header: "Balance",
                                                render: request => <Cell content={ requests !== null && requests.balances !== undefined ? requests.balances[request.assetDescription!.assetId] : "/" } />,
                                                width: "200px",
                                            },
                                            {
                                                header: "Legal officer",
                                                render: request => <Cell content={ getOfficer(request.legalOfficerAddress)!.name } />,
                                                width: "150px",
                                            }
                                        ]}
                                        data={ recoveredTokenizationRequests }
                                        colorTheme={ colorTheme }
                                        renderEmpty={ () => <EmptyTableMessage>No token to recover</EmptyTableMessage> }
                                    />
                            )
                        }
                    ]}
                    colors={ colorTheme.tabs }
                    onSelect={ key => setTabKey(key || 'tokens') }
                />
            </>
        </FullWidthPane>
    );
}
