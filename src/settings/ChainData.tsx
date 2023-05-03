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

import "./ChainData.css";
import Table, { Cell, EmptyTableMessage } from "src/common/Table";
import StaticLabelValue from "src/common/StaticLabelValue";

export default function ChainData() {
    const { colorTheme } = useCommonContext();
    const { onchainSettings, refreshOnchainSettings } = useLegalOfficerContext();
    const { api, accounts, getOfficer } = useLogionChain();
    const [ baseUrl, setBaseUrl ] = useState("");
    const [ nodeId, setNodeId ] = useState("");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ done, setDone ] = useState<"success" | "failure">();

    useEffect(() => {
        if(onchainSettings) {
            setBaseUrl(onchainSettings.hostData?.baseUrl || "");
            setNodeId(onchainSettings.hostData?.nodeId || "");
        }
    }, [ onchainSettings ]);

    const publish = useCallback(() => {
        if(accounts && api && accounts.current) {
            setDone(undefined);
            flushSync(() => setSignAndSubmit(null)); // Reset

            const legalOfficerAddress = accounts.current.accountId.address;
            const legalOfficerData = api.adapters.toPalletLoAuthorityListLegalOfficerDataHost({ nodeId, baseUrl });
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: legalOfficerAddress,
                submittable: api.polkadot.tx.loAuthorityList.updateLegalOfficer(legalOfficerAddress, legalOfficerData),
                callback: setResult,
                errorCallback: setError,
            });
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ accounts, api, baseUrl, nodeId ]);

    const onSuccess = useCallback(() => {
        setDone("success");
        refreshOnchainSettings();
    }, [ refreshOnchainSettings ]);

    const onError = useCallback(() => {
        setDone("failure");
    }, [  ]);

    const isNoChange = useMemo(() => {
        return baseUrl === (onchainSettings?.hostData?.baseUrl || "")
            && nodeId === (onchainSettings?.hostData?.nodeId || "");
    }, [ baseUrl, nodeId, onchainSettings ]);

    return (
        <div className="ChainData">
            <Row>
                <Col>
                    {
                        onchainSettings?.isHost === false &&
                        <StaticLabelValue
                            label="Node Base URL"
                            value={ baseUrl }
                        />
                    }
                    {
                        onchainSettings?.isHost === true &&
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
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    {
                        onchainSettings?.isHost === false &&
                        <StaticLabelValue
                            label="Node ID"
                            value={ nodeId }
                        />
                    }
                    {
                        onchainSettings?.isHost === true &&
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
                    }
                </Col>
            </Row>
            {
                onchainSettings?.isHost === false &&
                <Row>
                    <Col>
                        <StaticLabelValue
                            label="Host address"
                            value={ onchainSettings.hostAddress || "" }
                        />
                    </Col>
                </Row>
            }
            {
                onchainSettings?.isHost === true &&
                <>
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
                <Row>
                    <Col>
                        <div className="title">Guests</div>
                        <Table
                            columns={[
                                {
                                    header: "Address",
                                    render: guest => <Cell content={ guest } />
                                },
                                {
                                    header: "Name",
                                    render: guest => <Cell content={ getOfficer ? getOfficer(guest)?.name || "-" : "-" } />
                                },
                            ]}
                            data={ onchainSettings.guests || [] }
                            renderEmpty={ () => <EmptyTableMessage>No guest</EmptyTableMessage> }
                        />
                    </Col>
                </Row>
                </>
            }
        </div>
    );
}
