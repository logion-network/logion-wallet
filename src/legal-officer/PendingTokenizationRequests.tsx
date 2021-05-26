import React, { useState, useEffect } from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import {
    useLogionChain,
    Unsubscriber,
    signAndSend,
    ExtrinsicSignatureParameters,
    replaceUnsubscriber,
    ISubmittableResult
} from '../logion-chain';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { TokenizationRequest } from './Model';

enum AcceptState {
    ACCEPTANCE_PENDING,
    ACCEPTING,
    ACCEPTED,
    ISSUANCE_PENDING,
    ISSUING,
    DONE
}

export default function PendingTokenizationRequests() {
    const { api } = useLogionChain();
    const { pendingTokenizationRequests, rejectRequest, legalOfficerAddress } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<TokenizationRequest | null>(null);
    const [ acceptState, setAcceptState ] = useState<AcceptState | null>(null);
    const [ unsubscriber, setUnsubscriber ] = useState<Unsubscriber | null>(null);
    const [ assetCreationStatus, setAssetCreationStatus ] = useState<ISubmittableResult | null>(null);
    const [ assetCreationError, setAssetCreationError ] = useState<any>(null);

    const handleClose = () => setRequestToReject(null);

    const rejectAndCloseModal = async () => {
        await rejectRequest!(requestToReject!, reason);
        setRequestToReject(null);
    };

    const handleCloseAccept = () => {
        setRequestToAccept(null);
        setAcceptState(null);
        setAssetCreationStatus(null);
        setAssetCreationError(null);
    }

    const getTokenizationRequest = (requestId: string): (TokenizationRequest | null) => {
        for(let i = 0; i < pendingTokenizationRequests!.length; ++i) {
            const request = pendingTokenizationRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    useEffect(() => {
        if(acceptState === AcceptState.ACCEPTANCE_PENDING) {
            setAcceptState(AcceptState.ACCEPTING);
            // TODO: accept request (off-chain)
            setAcceptState(AcceptState.ACCEPTED);
        }
    }, [acceptState, setAcceptState]);

    useEffect(() => {
        if(acceptState === AcceptState.ISSUANCE_PENDING) {
            setAcceptState(AcceptState.ISSUING);
            const assetCreate: any = api!.tx.assets.create;
            const parameters: ExtrinsicSignatureParameters = {
                signerId: legalOfficerAddress,
                submittable: assetCreate(1, legalOfficerAddress, 0, 1), // TODO real call
                callback: setAssetCreationStatus,
                errorCallback: setAssetCreationError,
            };
            const newUnsubscriber = signAndSend(parameters);
            replaceUnsubscriber(unsubscriber, setUnsubscriber, newUnsubscriber);
        }
    }, [acceptState, setAcceptState, api, legalOfficerAddress, setAssetCreationStatus, setAssetCreationError, unsubscriber, setUnsubscriber]);

    useEffect(() => {
        if(acceptState === AcceptState.ISSUING
            && assetCreationStatus !== null
            && assetCreationStatus.isFinalized) {
            setAcceptState(AcceptState.DONE);
        }
    }, [acceptState, assetCreationStatus, setAcceptState]);

    if (pendingTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Pending Tokenization Requests</h1>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pendingTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.requesterAddress}</td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                                <td>
                                    <ButtonGroup aria-label="actions">
                                        <Button
                                            variant="success"
                                            onClick={() => setRequestToAccept(getTokenizationRequest(request.id))}
                                            data-testid={`accept-${request.id}`}
                                        >
                                            V
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => setRequestToReject(request.id)}
                                            data-testid={`reject-${request.id}`}
                                        >
                                            X
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            {
                requestToReject !== null &&
                <Modal
                    show={true}
                    onHide={handleClose}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Rejecting {requestToReject}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control as="textarea" rows={3} onChange={e => setReason(e.target.value)} value={reason} data-testid="reason" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={rejectAndCloseModal} data-testid={`confirm-reject-${requestToReject}`}>
                            Reject
                        </Button>
                    </Modal.Footer>
                </Modal>
            }

            {
                requestToAccept !== null && acceptState === null &&
                <Modal
                    show={true}
                    onHide={handleCloseAccept}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    data-testid="modal-accepting-{requestToAccept.id}"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Accept request {requestToAccept.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="info">
                            <p>You are about to</p>
                            <ol>
                                <li>accept the request,</li>
                                <li>create an asset and</li>
                                <li>issue {requestToAccept.bars} tokens
                                on account {requestToAccept.requesterAddress}.</li>
                            </ol>
                        </Alert>
    
                        <Alert variant="warning">
                            <p>Once started, the process has to be completed with no interruption.</p>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAccept}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => setAcceptState(AcceptState.ACCEPTANCE_PENDING)} data-testid={`proceed-accept-${requestToAccept?.id}`}>
                            Proceed
                        </Button>
                    </Modal.Footer>
                </Modal>
            }

            {
                requestToAccept !== null && acceptState === AcceptState.ACCEPTED &&
                <Modal
                    show={true}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    data-testid="modal-accepted-{requestToAccept?.id}"
                >
                    <Modal.Header>
                        <Modal.Title>Issuing tokens for request {requestToAccept.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="info">
                        <p>You are about to</p>
                            <ol>
                                <li>create an asset and</li>
                                <li>issue {requestToAccept.bars} tokens
                                on account {requestToAccept.requesterAddress}.</li>
                            </ol>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => setAcceptState(AcceptState.ISSUANCE_PENDING)} data-testid={`proceed-issue-${requestToAccept?.id}`}>
                            Proceed
                        </Button>
                    </Modal.Footer>
                </Modal>
            }

            {
                requestToAccept !== null && acceptState === AcceptState.ISSUING &&
                <Modal
                    show={true}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    data-testid="modal-issuing-{requestToAccept.id}"
                >
                    <Modal.Header>
                        <Modal.Title>Issuing tokens for request {requestToAccept.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { assetCreationStatus === null && assetCreationError === null &&
                            <p>Submitting transaction...</p>
                        }
                        { assetCreationStatus !== null && assetCreationError === null &&
                            <p>{`Current transaction status: ${assetCreationStatus.status.type}`}</p>
                        }
                        { assetCreationError !== null &&
                            <Alert variant="danger">
                            {`Asset creation failed: ${assetCreationError.toString()}`}
                            </Alert>
                        }
                    </Modal.Body>
                </Modal>
            }

            {
                requestToAccept !== null && acceptState === AcceptState.DONE &&
                <Modal
                    show={true}
                    onHide={handleCloseAccept}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    data-testid="modal-issued-{requestToAccept.id}"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Tokens issued for request {requestToAccept.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="success">
                        { requestToAccept.bars } tokens were successfully issued
                        on account { requestToAccept.requesterAddress }
                        (asset created in block {assetCreationStatus!.status.asFinalized.toString()}).
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCloseAccept} data-testid={`close-accept-${requestToAccept.id}`}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            }
        </>
    );
}
