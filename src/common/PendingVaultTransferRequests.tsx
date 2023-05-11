import { useCallback, useState } from "react";
import { Currency } from "@logion/node-api";
import { VaultState, VaultTransferRequest } from "@logion/client";

import { useLogionChain } from "../logion-chain";
import AmountCell, { toPrefixedLgnt } from "./AmountCell";
import Clickable from "./Clickable";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import { useUserContext } from "../wallet-user/UserContext";
import { Call, CallCallback } from "../ClientExtrinsicSubmitter";

export default function PendingVaultTransferRequests() {
    const { getOfficer, signer } = useLogionChain();
    const { mutateVaultState, vaultState } = useUserContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelFailed, setCancelFailed ] = useState(false);
    const [ call, setCall ] = useState<Call>();

    const cancelRequestCallback = useCallback(() => {
        setCall(async (callback: CallCallback) => {
            await mutateVaultState(async (vaultState: VaultState) => {
                return await vaultState.cancelVaultTransferRequest(
                    getOfficer!(requestToCancel!.legalOfficerAddress)!,
                    requestToCancel!,
                    signer!,
                    callback
                );
            })
        });
    }, [ requestToCancel, mutateVaultState, signer, getOfficer ]);

    if(!vaultState) {
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
                        render: () => <Cell content={`${Currency.SYMBOL}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ toPrefixedLgnt(request.amount) } />,
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
                data={ vaultState!.pendingVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <RequestToCancel
                cancelFailed={ cancelFailed }
                cancelRequestCallback={ cancelRequestCallback }
                requestToCancel={ requestToCancel }
                setCancelFailed={ setCancelFailed }
                setRequestToCancel={ setRequestToCancel }
                setCall={ setCall }
                call={ call }
            />
        </>
    );
}
