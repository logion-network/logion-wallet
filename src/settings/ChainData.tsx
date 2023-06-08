import { Region } from "@logion/node-api";
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
    const [ region, setRegion ] = useState<Region>();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ done, setDone ] = useState<"success" | "failure">();

    useEffect(() => {
        if(api && onchainSettings) {
            setBaseUrl(onchainSettings.hostData?.baseUrl || "");
            setNodeId(onchainSettings.hostData?.nodeId || "");
            setRegion(onchainSettings.hostData?.region || api.queries.getDefaultRegion());
        }
    }, [ api, onchainSettings ]);

    const publish = useCallback(() => {
        if(accounts && api && accounts.current && region) {
            setDone(undefined);
            flushSync(() => setSignAndSubmit(null)); // Reset

            const legalOfficerAddress = accounts.current.accountId.address;
            const legalOfficerData = api.adapters.toPalletLoAuthorityListLegalOfficerDataHost({ nodeId, baseUrl, region });
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: legalOfficerAddress,
                submittable: api.polkadot.tx.loAuthorityList.updateLegalOfficer(legalOfficerAddress, legalOfficerData),
                callback: setResult,
                errorCallback: setError,
            });
            setSignAndSubmit(() => signAndSubmit);
        }
    }, [ accounts, api, baseUrl, nodeId, region ]);

    const onSuccess = useCallback(() => {
        setDone("success");
        setSignAndSubmit(null);
        refreshOnchainSettings();
    }, [ refreshOnchainSettings ]);

    const onError = useCallback(() => {
        setDone("failure");
    }, [  ]);

    const isNoChange = useMemo(() => {
        return baseUrl === (onchainSettings?.hostData?.baseUrl || "")
            && nodeId === (onchainSettings?.hostData?.nodeId || "")
            && region === (onchainSettings?.hostData?.region || "");
    }, [ baseUrl, nodeId, region, onchainSettings ]);

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
                        <div className="guests-title">Guests</div>
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
            <Row>
                <Col>
                    <StaticLabelValue
                        label="Region"
                        value={ region || "" }
                    />
                </Col>
            </Row>
        </div>
    );
}
