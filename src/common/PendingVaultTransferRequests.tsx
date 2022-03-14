import { useCallback, useState } from "react";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";
import { prefixedLogBalance, SYMBOL } from "../logion-chain/Balances";
import { NONE, PrefixedNumber } from "../logion-chain/numbers";
import { getRecoveryConfig } from "../logion-chain/Recovery";
import { cancelVaultTransfer } from "../logion-chain/Vault";
import { VaultApi, VaultTransferRequest } from "../vault/VaultApi";
import AmountCell from "./AmountCell";
import Clickable from "./Clickable";
import { useCommonContext } from "./CommonContext";
import Dialog from "./Dialog";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";

export default function PendingVaultTransferRequests() {
    const { api } = useLogionChain();
    const { pendingVaultTransferRequests, axiosFactory, refresh, accounts } = useCommonContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelFailed, setCancelFailed ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const cancelRequestCallback = useCallback(async () => {
        const signerId = accounts!.current!.address;
        const recoveryConfig = await getRecoveryConfig({
            api: api!,
            accountId: signerId
        })
        const amount = new PrefixedNumber(requestToCancel!.amount, NONE);
        const signAndSubmit: SignAndSubmit = (setResult, setError) => cancelVaultTransfer({
            api: api!,
            callback: setResult,
            errorCallback: setError,
            signerId: accounts!.current!.address,
            destination: requestToCancel!.destination,
            amount,
            block: BigInt(requestToCancel!.block),
            index: requestToCancel!.index,
            recoveryConfig: recoveryConfig!,
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ accounts, api, requestToCancel, setSignAndSubmit ]);

    const onCancelSuccessCallback = useCallback(async () => {
        const legalOfficer = requestToCancel!.legalOfficerAddress;
        const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
        await api.cancelVaultTransferRequest(requestToCancel!.id);
        setRequestToCancel(null);
        refresh!();
    }, [ requestToCancel, axiosFactory, setRequestToCancel, refresh ]);

    if(!pendingVaultTransferRequests) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
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
                        header: "Status",
                        render: request => <VaultTransferRequestStatusCell status={ request.status } />,
                        width: '150px',
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
                        width: '72px',
                    },
                ]}
                data={ pendingVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <Dialog
                show={ requestToCancel !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        id: "cancel",
                        callback: () => setRequestToCancel(null),
                        disabled: signAndSubmit !== null && !cancelFailed
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "primary",
                        id: "proceed",
                        callback: () => cancelRequestCallback(),
                        disabled: signAndSubmit !== null
                    }
                ]}
                size="lg"
            >
                <h2>Cancel vault-out transfer</h2>

                <p>This will cancel the vault-out transfer. Your Legal Officer will be notified.</p>

                <ExtrinsicSubmitter
                    id="cancel"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ onCancelSuccessCallback }
                    onError={ () => setCancelFailed(true) }
                />
            </Dialog>
        </>
    );
}
