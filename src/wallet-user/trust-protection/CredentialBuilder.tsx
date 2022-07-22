import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { DidUri } from "@kiltprotocol/sdk-js";

import { useLogionChain } from "../../logion-chain";
import Button from "../../common/Button";

export default function CredentialBuilder() {
    const { kilt } = useLogionChain();
    const [ did, setDid ] = useState("");
    const [ request, setRequest ] = useState("");
    const [ attestation, setAttestation ] = useState("");
    const [ credential, setCredential ] = useState("");

    const buildCredentialsCallback = useCallback(async () => {
        const credential = await kilt!.buildCredential({
            requesterDidUri: did as DidUri,
            request: JSON.parse(request),
            attestation: JSON.parse(attestation),
        });
        setCredential(JSON.stringify(credential.request, undefined, 4));
    }, [ kilt, request, attestation, did ]);

    return (
        <>
            {
                !credential &&
                <>
                    <Form.Group controlId='did'>
                        <Form.Label>DID</Form.Label>
                        <Form.Control
                            onChange={ e => setDid(e.target.value) }
                            value={ did }
                        />
                    </Form.Group>
                    <Form.Group controlId='request'>
                        <Form.Label>Request</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            onChange={ e => setRequest(e.target.value) }
                            value={ request }
                        />
                    </Form.Group>
                    <Form.Group controlId='attestation'>
                        <Form.Label>Attestation</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            onChange={ e => setAttestation(e.target.value) }
                            value={ attestation }
                        />
                    </Form.Group>
                    <Button onClick={ buildCredentialsCallback }>
                        Build credential
                    </Button>
                </>
            }
            {
                credential &&
                <Form.Group controlId='credential'>
                    <Form.Label>Credential</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        onChange={ e => setCredential(e.target.value) }
                        value={ credential }
                    />
                </Form.Group>
            }
        </>
    );
}
