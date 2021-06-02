import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

import { USER_PATH } from '../RootPaths';
import { TokenizationRequest } from '../legal-officer/Model';
import { useLogionChain, AssetBalance, tokensFromBalance } from '../logion-chain';

import { useUserContext } from './UserContext';

interface MyTokensParams {
    address: string
}

interface EnrichedRequests {
    requests: TokenizationRequest[],
    querying: boolean,
    balances?: AssetBalance[],
}

export default function MyTokens() {
    const { acceptedTokenizationRequests } = useUserContext();
    const { address } = useParams<MyTokensParams>();
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
                    request => api.query.assets.account(request.assetDescription!.assetId, address)));
                setRequests({
                    requests: requests.requests,
                    querying: false,
                    balances: balances.map(balance => balance.balance)
                });
            })();
        }
    }, [ api, requests, setRequests, address ]);

    return (
        <>
            <h1>My Tokens</h1>
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
            <Link to={ USER_PATH }>Back to dashboard</Link>
        </>
    );
}
