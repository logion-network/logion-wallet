import React, { useEffect, useState } from 'react';

import Table, { Cell, EmptyTableMessage } from '../common/Table';

import { useCommonContext } from '../common/CommonContext';

import { useLogionChain } from '../logion-chain';
import { accountBalance, AssetWithBalance } from '../logion-chain/Assets';

import { getOfficer } from "../common/types/LegalOfficer";

interface Balances {
    accountId: string,
    balances?: AssetWithBalance[],
}

export default function MyTokens() {
    const { accounts } = useCommonContext();
    const { api } = useLogionChain();
    const [ balances, setBalances ] = useState<Balances | null>(null);

    useEffect(() => {
        const currentAddress = accounts?.current?.address;
        if(currentAddress !== undefined &&
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
    }, [ api, balances, accounts, setBalances ]);

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
            renderEmpty={ () => (
                <EmptyTableMessage>No token to display</EmptyTableMessage>
            )}
        />
    );
}
