import { useCallback, useState } from "react";
import { prefixedLogBalance, SYMBOL } from "@logion/node-api/dist/Balances";

import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";
import { VaultTransferRequest } from "../vault/VaultApi";
import AmountCell from "./AmountCell";
import Clickable from "./Clickable";
import { useCommonContext } from "./CommonContext";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import { cancelVaultTransferCallback, onCancelVaultTransferSuccessCallback } from "./VaultTransferRequestsCallbacks";

export default function PendingVaultTransferRequests() {
    const { api } = useLogionChain();
    const { pendingVaultTransferRequests, axiosFactory, refresh, accounts } = useCommonContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelFailed, setCancelFailed ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const cancelRequestCallback = useCallback(() => cancelVaultTransferCallback({
        api: api!,
        requestToCancel: requestToCancel!,
        signerId: accounts!.current!.address,
        setSignAndSubmit
    }), [ accounts, api, requestToCancel, setSignAndSubmit ]);

    const onCancelSuccessCallback = useCallback(() => onCancelVaultTransferSuccessCallback({
        requestToCancel: requestToCancel!,
        axiosFactory: axiosFactory!,
        refresh: refresh!,
        setSignAndSubmit,
        setRequestToCancel
    }), [ requestToCancel, axiosFactory, setRequestToCancel, refresh ]);

    if(!pendingVaultTransferRequests) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "",
                        render: () => <Cell content={ <Icon icon={{ id: "pending" }} height="30px" /> } />,
                        width: "50px",
                    },
                    {
                        header: "Legal Officer",
                        render: request => <LegalOfficerName address={ request.legalOfficerAddress } />,
                        align: 'left',
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${SYMBOL}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ prefixedLogBalance(request.amount) } />,
                        align: 'right',
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "120px"
                        }),
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                    {
                        header: "",
                        render: request => (
                            <Cell content={ <Clickable
                                onClick={ () => setRequestToCancel(request) }
                            >
                                <Icon icon={{id: "ko"}} />
                            </Clickable> } />
                        ),
                        width: '130px',
                    },
                ]}
                data={ pendingVaultTransferRequests(true) }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <RequestToCancel
                cancelFailed={ cancelFailed }
                cancelRequestCallback={ cancelRequestCallback }
                onCancelSuccessCallback={ onCancelSuccessCallback }
                requestToCancel={ requestToCancel }
                setCancelFailed={ setCancelFailed }
                setRequestToCancel={ setRequestToCancel }
                setSignAndSubmit={ setSignAndSubmit }
                signAndSubmit={ signAndSubmit }
            />
        </>
    );
}
