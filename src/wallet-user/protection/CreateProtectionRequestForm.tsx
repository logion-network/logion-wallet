import { LocsState, LogionClient } from "@logion/client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";

import Button from "../../common/Button";
import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Alert from "../../common/Alert";
import FormGroup from '../../common/FormGroup';
import NetworkWarning from '../../common/NetworkWarning';
import { useCommonContext } from "../../common/CommonContext";

import { useUserContext } from "../UserContext";
import { CallCallback, useLogionChain } from '../../logion-chain';
import { SETTINGS_PATH } from '../UserPaths';

import LegalOfficers from './LegalOfficers';

import './CreateProtectionRequestForm.css';
import { LegalOfficerAndLoc } from './SelectLegalOfficerAndLoc';
import ExtrinsicSubmissionStateView from 'src/ExtrinsicSubmissionStateView';

export function getLegalOfficerAndLocs(locsState: LocsState | undefined, client: LogionClient | null) {
    if(locsState && client) {
        const closedIdentityLocs = locsState.closedLocs["Identity"];
        const list: LegalOfficerAndLoc[] = [];
        for(const loc of closedIdentityLocs) {
            list.push({
                loc: loc.locId,
                legalOfficer: client.getLegalOfficer(loc.data().ownerAddress),
            });
        }
        return list;
    } else {
        return [];
    }
}

export interface Props {
    isRecovery: boolean,
}

export default function CreateProtectionRequestForm(props: Props) {
    const { api, client, clearSubmissionState, submitCall, extrinsicSubmissionState } = useLogionChain();
    const { colorTheme, nodesDown } = useCommonContext();
    const { createProtectionRequest, locsState } = useUserContext();
    const [ legalOfficer1, setLegalOfficer1 ] = useState<LegalOfficerAndLoc | null>(null);
    const [ legalOfficer2, setLegalOfficer2 ] = useState<LegalOfficerAndLoc | null>(null);
    const [ addressToRecover, setAddressToRecover ] = useState<string>("");
    const [ addressToRecoverError, setAddressToRecoverError ] = useState<string>("");

    const legalOfficersAndLocs = useMemo(() => getLegalOfficerAndLocs(locsState, client), [ locsState, client ]);

    const canSubmit = useMemo(() => {
        return legalOfficer1 !== null
        && legalOfficer2 !== null
        && (!props.isRecovery || addressToRecoverError === "");
    }, [ legalOfficer1, legalOfficer2, props.isRecovery, addressToRecoverError ]);

    const submit = useCallback(async () => {
        if(!canSubmit) {
            return;
        }

        const call = async (callback: CallCallback) => {
            await createProtectionRequest!({
                legalOfficers: [
                    legalOfficer1!.legalOfficer,
                    legalOfficer2!.legalOfficer,
                ],
                addressToRecover: props.isRecovery ? addressToRecover : undefined,
                callback,
                requesterIdentityLoc1: legalOfficer1!.loc,
                requesterIdentityLoc2: legalOfficer2!.loc,
            });
        };

        try {
            await submitCall(call);
        } finally {
            clearSubmissionState();
        }
    }, [ legalOfficer1, legalOfficer2, addressToRecover, props.isRecovery, createProtectionRequest, submitCall, clearSubmissionState, canSubmit ]);

    let mainTitle;
    if(props.isRecovery) {
        mainTitle = "Recovery";
    } else {
        mainTitle = "My Logion Protection";
    }

    let subTitle;
    if(props.isRecovery) {
        subTitle = "Start recovery process";
    } else {
        subTitle = "Activate my Logion Protection";
    }

    useEffect(() => {
        if(!props.isRecovery) {
            setAddressToRecoverError("");
        } else {
            if(client !== null && client.isValidAddress(addressToRecover)) {
                setAddressToRecoverError("Checking recovery config...");
                (async function() {
                    if(await client.isProtected(addressToRecover)) {
                        setAddressToRecoverError("");
                    } else {
                        setAddressToRecoverError("This SS58 address is not set up for recovery");
                    }
                })();
            } else {
                setAddressToRecoverError("A valid SS58 address is required");
            }
        }
    }, [ api, addressToRecover, client, props.isRecovery ])

    let legalOfficersTitle;
    if(props.isRecovery) {
        legalOfficersTitle = "Select your Legal Officers";
    } else {
        legalOfficersTitle = "Choose your Legal Officers";
    }

    return (
        <FullWidthPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            titleIcon={{
                icon: {
                    id: props.isRecovery ? 'recovery' : 'shield',
                    hasVariants: props.isRecovery ? false : true,
                },
                background: props.isRecovery ? colorTheme.recoveryItems.iconGradient : undefined,
            }}
        >
            {
                nodesDown.length > 0 &&
                <Row>
                    <Col>
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    </Col>
                </Row>
            }
            <Row>
                <Col>
                    {
                        props.isRecovery &&
                        <Frame
                            className="CreateProtectionRequestFormInitiateRecovery"
                        >
                            <h3>Initiate recovery</h3>
                            <FormGroup
                                id="accountToRecover"
                                label="Address to Recover"
                                control={
                                    <Form.Control
                                        isInvalid={ addressToRecoverError !== "" }
                                        type="text"
                                        data-testid="addressToRecover"
                                        value={ addressToRecover }
                                        onChange={ event => setAddressToRecover(event.target.value) }
                                    />
                                }
                                feedback={ addressToRecoverError }
                                colors={ colorTheme.frame }
                            />
                        </Frame>
                    }

                    <Frame
                        className="CreateProtectionRequestFormLegalOfficers"
                        disabled={ addressToRecoverError !== "" }
                    >
                        <h3>{ legalOfficersTitle }</h3>
                        {
                            props.isRecovery &&
                            <Alert variant="warning">
                                Please select the 2 legal officers you’ve selected at the creation of the account to be
                                recovered. Please note that those Legal Officers will execute their due diligence to authorize
                                the recovery and will be, then, the two Legal Officers in charge of protecting this current
                                account you are using to get your assets back.
                            </Alert>
                        }

                        {
                            legalOfficersAndLocs.length < 2 &&
                            <Alert variant="warning">
                                You do not have 2 valid (i.e. closed and non-void) Identity LOCs yet.
                            </Alert>
                        }
                        {
                            legalOfficersAndLocs.length >= 2 &&
                            <>
                            <LegalOfficers
                                legalOfficers={ legalOfficersAndLocs }
                                legalOfficer1={ legalOfficer1 }
                                setLegalOfficer1={ setLegalOfficer1 }
                                legalOfficer2={ legalOfficer2 }
                                setLegalOfficer2={ setLegalOfficer2 }
                                label={ props.isRecovery ? "Select Legal Officer N°" : "Choose Legal Officer N°" }
                            />

                            <ExtrinsicSubmissionStateView
                                successMessage="Recovery successfully initiated."
                            />

                            {
                                extrinsicSubmissionState.canSubmit() && canSubmit &&
                                <Button
                                    onClick={ submit }
                                    variant={ "polkadot" }
                                >
                                    Proceed
                                </Button>
                            }
                            </>
                        }
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
