import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { flushSync } from "react-dom";

import ExtrinsicSubmitter, { SignAndSubmit } from "src/ExtrinsicSubmitter";
import Button from "src/common/Button";
import { useCommonContext } from "src/common/CommonContext";
import FormGroup from "src/common/FormGroup";
import { useLegalOfficerContext } from "src/legal-officer/LegalOfficerContext";
import { signAndSend } from "src/logion-chain/Signature";
import { useLogionChain } from "src/logion-chain";
import { updateLegalOfficerDataExtrinsic } from "src/legal-officer/LegalOfficerData";

import "./ChainData.css";

export default function ChainData() {
    const { colorTheme } = useCommonContext();
    const { onchainSettings, refreshRequests } = useLegalOfficerContext();
    const { api, accounts } = useLogionChain();
    const [ baseUrl, setBaseUrl ] = useState("");
    const [ nodeId, setNodeId ] = useState("");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ done, setDone ] = useState(false);

    useEffect(() => {
        if(onchainSettings) {
            setBaseUrl(onchainSettings.baseUrl || "");
            setNodeId(onchainSettings.nodeId || "");
        }
    }, [ onchainSettings ]);

    const publish = useCallback(() => {
        if(accounts && api && accounts.current) {
            setDone(false);
            flushSync(() => setSignAndSubmit(null)); // Reset

            const legalOfficerAddress = accounts.current.address;
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: legalOfficerAddress,
                submittable: updateLegalOfficerDataExtrinsic({
                    api,
                    address: legalOfficerAddress,
                    legalOfficerData: { nodeId, baseUrl },
                }),
                callback: setResult,
                errorCallback: setError,
            });
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ accounts, api, baseUrl, nodeId ]);

    const onSuccess = useCallback(() => {
        setDone(true);
        refreshRequests(false);
    }, [ refreshRequests ]);

    const onError = useCallback(() => {
        setDone(true);
    }, [  ]);

    const isNoChange = useMemo(() => {
        return baseUrl === (onchainSettings?.baseUrl || "")
            && nodeId === (onchainSettings?.nodeId || "");
    }, [ baseUrl, nodeId, onchainSettings ]);

    return (
        <div className="ChainData">
            <Row>
                <Col>
                    <FormGroup
                        id="baseUrl"
                        label="Node Base URL"
                        control={ <Form.Control
                            type="text"
                            value={ baseUrl }
                            onChange={ event => setBaseUrl(event.target.value) }
                            isInvalid={ !baseUrl }
                        /> }
                        colors={ colorTheme.frame }
                        feedback={ baseUrl ? undefined : "The node base URL must be set" }
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup
                        id="nodeId"
                        label="Node ID"
                        control={ <Form.Control
                            type="text"
                            value={ nodeId }
                            onChange={ event => setNodeId(event.target.value) }
                            isInvalid={ !nodeId }
                        /> }
                        colors={ colorTheme.frame }
                        feedback={ nodeId ? undefined : "The node ID must be set" }
                    />
                </Col>
            </Row>
            <Button
                variant="polkadot"
                onClick={ publish }
                disabled={ (signAndSubmit !== null && !done) || isNoChange }
            >
                Publish to blockchain
            </Button>
            <div className="submitter-container">
                <ExtrinsicSubmitter
                    id="publish"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ onSuccess }
                    onError={ onError }
                />
            </div>
        </div>
    );
}
