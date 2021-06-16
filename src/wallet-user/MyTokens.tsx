import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';

import { useRootContext } from '../RootContext';

import { TokenizationRequest } from '../legal-officer/Types';
import { useLogionChain, AssetBalance, tokensFromBalance } from '../logion-chain';

import { useUserContext } from './UserContext';

interface EnrichedRequests {
    requests: TokenizationRequest[],
    querying: boolean,
    balances?: AssetBalance[],
}

export default function MyTokens() {
    const { currentAddress } = useRootContext();
    const { acceptedTokenizationRequests } = useUserContext();
    const { api } = useLogionChain();

    const [ requests, setRequests ] = useState<EnrichedRequests | null>(null);

    useEffect(() => {
        if(acceptedTokenizationRequests !== null
                && (requests === null || acceptedTokenizationRequests !== requests!.requests)) {
            setRequests({
                requests: acceptedTokenizationRequests,
                querying: false
            });
        }
    }, [ acceptedTokenizationRequests, requests, setRequests ]);

    useEffect(() => {
        if(api !== null && requests !== null && !requests.querying && requests.balances === undefined) {
            setRequests({
                requests: requests.requests,
                querying: true
            });
            (async function() {
                const balances = await Promise.all(requests.requests.map(
                    request => api.query.assets.account(request.assetDescription!.assetId, currentAddress)));
                setRequests({
                    requests: requests.requests,
                    querying: false,
                    balances: balances.map(balance => balance.balance)
                });
            })();
        }
    }, [ api, requests, setRequests, currentAddress ]);

    return (
        <>
            {
                requests !== null && requests.balances !== undefined &&
                <Table striped bordered>
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            requests.requests.map((request, index) => (
                                <tr key={request.id}>
                                    <td>{request.requestedTokenName}</td>
                                    <td>{tokensFromBalance(requests.balances![index], request.assetDescription!.decimals)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            }
        </>
    );
}
