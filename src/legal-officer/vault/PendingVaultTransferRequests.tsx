import { useCallback, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

import ExtrinsicSubmitter, { AsyncSignAndSubmit } from "../../ExtrinsicSubmitter";

import { useLogionChain } from "../../logion-chain";
import { LGNT_SMALLEST_UNIT, prefixedLogBalance, SYMBOL } from "../../logion-chain/Balances";
import { PrefixedNumber } from "../../logion-chain/numbers";
import { approveVaultTransfer } from "../../logion-chain/Vault";

import AmountCell from "../../common/AmountCell";
import { useCommonContext } from "../../common/CommonContext";
import Dialog from "../../common/Dialog";
import Icon from "../../common/Icon";
import { useResponsiveContext } from "../../common/Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "../../common/Table";
import VaultTransferRequestStatusCell from "../../common/VaultTransferRequestStatusCell";
import UserIdentityNameCell from "../../common/UserIdentityNameCell";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import FormGroup from "../../common/FormGroup";
import StaticLabelValue from "../../common/StaticLabelValue";
import AmountFormat from "../../common/AmountFormat";
import AddressFormat from "../../common/AddressFormat";
import DateTimeFormat from "../../common/DateTimeFormat";

import { VaultApi, VaultTransferRequest } from "../../vault/VaultApi";

import VaultTransferRequestDetails from "./VaultTransferDetails";

export default function PendingVaultTransferRequests() {
    const { api } = useLogionChain();
    const { pendingVaultTransferRequests, axiosFactory, refresh, accounts, colorTheme } = useCommonContext();
    const { width } = useResponsiveContext();
    const [ requestToReject, setRequestToReject ] = useState<VaultTransferRequest | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<VaultTransferRequest | null>(null);
    const [ approvalFailed, setApprovalFailed ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<AsyncSignAndSubmit>(null);

    const acceptRequestCallback = useCallback(async () => {
        const signerId = accounts!.current!.address;
        const amount = new PrefixedNumber(requestToAccept!.amount, LGNT_SMALLEST_UNIT);
        const signAndSubmit: AsyncSignAndSubmit = (setResult, setError) => approveVaultTransfer({
            api: api!,
            callback: setResult,
            errorCallback: setError,
            signerId,
            requester: requestToAccept!.requesterAddress,
            destination: requestToAccept!.destination,
            amount,
            block: BigInt(requestToAccept!.block),
            index: requestToAccept!.index,
            recovery: true // TODO Should not be hard-coded to true.
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ accounts, api, requestToAccept, setSignAndSubmit ]);

    const onApprovalSuccessCallback = useCallback(async () => {
        const legalOfficer = requestToAccept!.legalOfficerAddress;
        const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
        await api.acceptVaultTransferRequest(requestToAccept!.id);
        setRequestToAccept(null);
        refresh!();
    }, [ requestToAccept, axiosFactory, setRequestToAccept, refresh ]);

    const rejectRequestCallback = useCallback(async () => {
        const legalOfficer = requestToReject!.legalOfficerAddress;
        const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
        await api.rejectVaultTransferRequest(requestToReject!.id, reason);
        setRequestToReject(null);
        refresh!();
    }, [ requestToReject, axiosFactory, setRequestToReject, refresh, reason ]);

    if(!pendingVaultTransferRequests) {
        return null;
    }

    const getRequest = (requestId: string): (VaultTransferRequest | null) => {
        for(let i = 0; i < pendingVaultTransferRequests!.length; ++i) {
            const request = pendingVaultTransferRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "User",
                        render: request => <UserIdentityNameCell userIdentity={ request.requesterIdentity } />,
                        align: "left",
                        renderDetails: request => <VaultTransferRequestDetails request={ request }/>
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
                        render: request => <VaultTransferRequestStatusCell status={ request.status } viewer="Legal Officer" />,
                        width: '150px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                    {
                        header: "Action",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={ () => setRequestToReject(getRequest(request.id)) }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ko"}} height='40px' />
                                </Button>
                                <Button
                                    onClick={ () => setRequestToAccept(getRequest(request.id)) }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ok"}} height='40px' />
                                </Button>
                            </ButtonGroup>
                        ),
                        width: width({
                            onSmallScreen: "170px",
                            otherwise: "250px"
                        }),
                    },
                ]}
                data={ pendingVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <Dialog
                show={ requestToAccept !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary-polkadot",
                        id: "cancel",
                        callback: () => setRequestToAccept(null),
                        disabled: signAndSubmit !== null && !approvalFailed
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "polkadot",
                        id: "proceed",
                        callback: () => acceptRequestCallback(),
                        disabled: signAndSubmit !== null
                    }
                ]}
                size="xl"
            >
                <h2>Accepting vault-out transfer</h2>

                <p>You are about to accept and sign a transfer authorization from the user's Vault.</p>

                <p>By clicking on "Proceed", you acknowledge the fact you did all required verifications to be sure the requester and owner of the asset stored in his/her Vault did that request him/herself. You understand, this action is irreversible: all related assets will be irremediably transferred to the destination account mentioned below.</p>

                <Row>
                    <Col>
                        <StaticLabelValue
                            label="Name"
                            value={ `${requestToAccept?.requesterIdentity.firstName} ${requestToAccept?.requesterIdentity.lastName}` }
                        />
                    </Col>
                    <Col md={ 3 }>
                        <StaticLabelValue
                            label="Destination"
                            value={ <AddressFormat address={ requestToAccept?.requesterAddress } /> }
                        />
                    </Col>
                    <Col md={ 1 }>
                        <StaticLabelValue
                            label="Type"
                            value="LGNT"
                        />
                    </Col>
                    <Col>
                        <StaticLabelValue
                            label="Amount"
                            value={ requestToAccept ? <AmountFormat amount={ prefixedLogBalance(requestToAccept.amount) } /> : "" }
                        />
                    </Col>
                    <Col>
                        <StaticLabelValue
                            label="Creation date"
                            value={ <DateTimeFormat dateTime={ requestToAccept?.createdOn } /> }
                        />
                    </Col>
                </Row>

                <ExtrinsicSubmitter
                    id="approve"
                    asyncSignAndSubmit={ signAndSubmit }
                    onSuccess={ onApprovalSuccessCallback }
                    onError={ () => setApprovalFailed(true) }
                />
            </Dialog>
            <Dialog
                show={ requestToReject !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        id: "cancel",
                        callback: () => setRequestToReject(null),
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "primary",
                        id: "proceed",
                        callback: () => rejectRequestCallback(),
                    }
                ]}
                size="lg"
            >
                <h2>Reject vault-out transfer</h2>

                <FormGroup
                    id="reason"
                    label="Reason"
                    control={
                        <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={e => setReason(e.target.value)}
                        value={reason}
                        data-testid="reason"
                        />
                    }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
        </>
    );
}
