import { useCallback, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Lgnt, ValidAccountId } from "@logion/node-api";
import { VaultTransferRequest } from "@logion/client";

import { CallCallback, useLogionChain } from "../../logion-chain";
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

import { VaultApi } from "../../vault/VaultApi";

import VaultTransferRequestDetails from "./VaultTransferDetails";
import { useLegalOfficerContext } from "../LegalOfficerContext";
import InlineDateTime from "src/common/InlineDateTime";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

export default function PendingVaultTransferRequests() {
    const { api, axiosFactory, accounts, submitCall, signer, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { pendingVaultTransferRequests, refreshRequests } = useLegalOfficerContext();
    const { width } = useResponsiveContext();
    const [ requestToReject, setRequestToReject ] = useState<VaultTransferRequest | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<VaultTransferRequest | null>(null);

    const onApprovalSuccessCallback = useCallback(async () => {
        const legalOfficer = ValidAccountId.polkadot(requestToAccept!.legalOfficerAddress);
        const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
        await api.acceptVaultTransferRequest(requestToAccept!.id);
        setRequestToAccept(null);
        refreshRequests!(false);
    }, [ requestToAccept, axiosFactory, setRequestToAccept, refreshRequests ]);

    const acceptRequestCallback = useCallback(async () => {
        const signerId = accounts!.current!.accountId;
        const amount = Lgnt.fromCanonical(BigInt(requestToAccept!.amount));
        const config = await api!.queries.getRecoveryConfig(ValidAccountId.polkadot(requestToAccept!.origin));
        if(!config) {
            throw new Error("Cannot approve vault transfer for requester without recovery configured");
        }
        const vault = api!.vault(ValidAccountId.polkadot(requestToAccept!.origin), config.legalOfficers);
        const submittable = await vault.tx.approveVaultTransfer({
            signerId,
            destination: ValidAccountId.polkadot(requestToAccept!.destination),
            amount,
            block: BigInt(requestToAccept!.block),
            index: requestToAccept!.index,
        });
        const call = async (callback: CallCallback) => {
            await signer?.signAndSend({
                signerId,
                submittable,
                callback,
            });
        };
        try {
            await submitCall(call);
            onApprovalSuccessCallback();
        } catch(e) {
            console.log(e);
        } finally {
            clearSubmissionState();
        }
    }, [ accounts, api, requestToAccept, submitCall, onApprovalSuccessCallback, clearSubmissionState, signer ]);

    const rejectRequestCallback = useCallback(async () => {
        const legalOfficer = ValidAccountId.polkadot(requestToReject!.legalOfficerAddress);
        const api = new VaultApi(axiosFactory!(legalOfficer), legalOfficer);
        await api.rejectVaultTransferRequest(requestToReject!.id, reason);
        setRequestToReject(null);
        refreshRequests!(false);
    }, [ requestToReject, axiosFactory, setRequestToReject, refreshRequests, reason ]);

    if(!pendingVaultTransferRequests) {
        return null;
    }

    const getRequest = (requestId: string): (VaultTransferRequest | null) => {
        const pendingRequests = pendingVaultTransferRequests;
        for(let i = 0; i < pendingRequests!.length; ++i) {
            const request = pendingRequests[i];
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
                        render: () => <Cell content={`${Lgnt.CODE}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ Lgnt.fromCanonical(BigInt(request.amount)) } />,
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
                renderEmpty={ () => <EmptyTableMessage>No pending vault withdrawals</EmptyTableMessage> }
            />
            <Dialog
                show={ requestToAccept !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary-polkadot",
                        id: "cancel",
                        callback: () => setRequestToAccept(null),
                        disabled: extrinsicSubmissionState.inProgress
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "polkadot",
                        id: "proceed",
                        callback: () => acceptRequestCallback(),
                        disabled: !extrinsicSubmissionState.canSubmit(),
                    }
                ]}
                size="xl"
            >
                <h2>Accepting vault withdrawal</h2>

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
                            value={ <AddressFormat address={ requestToAccept?.destination } /> }
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
                            value={ requestToAccept ? <AmountFormat amount={ Lgnt.fromCanonical(BigInt(requestToAccept.amount)) } /> : "" }
                        />
                    </Col>
                    <Col>
                        <StaticLabelValue
                            label="Creation date"
                            value={ <InlineDateTime dateTime={ requestToAccept?.createdOn } /> }
                        />
                    </Col>
                </Row>

                <ExtrinsicSubmissionStateView />
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
                <h2>Reject vault withdrawal</h2>

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
