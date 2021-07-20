import React, { useEffect, useState } from 'react';

import Table, { Cell, EmptyTableMessage } from '../component/Table';

import { useRootContext } from '../RootContext';

import { useLogionChain } from '../logion-chain';
import { AssetWithBalance } from '../logion-chain/Types';
import { accountBalance } from '../logion-chain/Assets';

import { useUserContext } from './UserContext';
import { getOfficer } from "./trust-protection/Model";

interface Balances {
    accountId: string,
    balances?: AssetWithBalance[],
}

export default function MyTokens() {
    const { currentAddress } = useRootContext();
    const { colorTheme } = useUserContext();
    const { api } = useLogionChain();
    const [ balances, setBalances ] = useState<Balances | null>(null);

    useEffect(() => {
        if(currentAddress !== "" &&
                (balances === null || balances.accountId !== currentAddress)) {

            const accountId = currentAddress;
            setBalances({
                accountId,
            });
            (async function() {
                const balances = await accountBalance({
                    api: api!,
                    accountId,
                });
                setBalances({
                    accountId,
                    balances,
                });
            })();
        }
    }, [ api, balances, currentAddress, setBalances ]);

    const tokens: AssetWithBalance[] = (balances !== null && balances.balances !== undefined) ? balances.balances.filter(token => Number(token.balance) > 0) : [];
    return (
        <Table
            columns={[
                {
                    header: "Name",
                    render: token => <Cell content={ token.asset.metadata.symbol } />,
                    width: "150px",
                },
                {
                    header: "Description",
                    render: token => <Cell content={ token.asset.metadata.name } />,
                },
                {
                    header: "Balance",
                    render: token => <Cell content={ token.balance } />,
                    width: "200px",
                },
                {
                    header: "Legal officer",
                    render: token => <Cell content={ getOfficer(token.asset.issuer)!.name } />,
                    width: "150px",
                }
            ]}
            data={ tokens }
            colorTheme={ colorTheme }
            renderEmpty={ () => (
                <EmptyTableMessage>No token to display</EmptyTableMessage>
            )}
        />
    );
}
