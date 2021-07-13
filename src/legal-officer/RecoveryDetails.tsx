import { useRootContext } from "../RootContext";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { FullWidthPane } from "../component/Dashboard";
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { RECOVERY_REQUESTS_PATH } from "./LegalOfficerPaths";
import Button from "../component/Button";
import React, { useEffect, useState } from "react";
import { ButtonGroup, Col, Row } from "react-bootstrap";
import { fetchRecoveryInfo } from "./Model";
import { RecoveryInfo } from "./Types";
import AccountInfo from "../component/AccountInfo";
import Alert from "../component/Alert";
import Frame from "../component/Frame";
import '../component/Position.css';

export default function RecoveryDetails() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();
    const { requestId } = useParams<{ requestId: string }>();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);

    useEffect(() => {
        if (recoveryInfo === null) {
            fetchRecoveryInfo(requestId)
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ setRecoveryInfo, requestId ])

    if (addresses === null || selectAddress === null || recoveryInfo === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryDetails"
            mainTitle="Account Recovery Execution"
            titleIcon={ {
                icon: {
                    id: 'recovery_request',
                    hasVariants: true,
                },
            } }
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Frame colors={ colorTheme }>
                <Row>
                    <Alert variant="info">
                        I did my due diligence and authorize the transfer of all assets<br />
                        from the account address "From" to the account address "To" as detailed below :
                    </Alert>
                </Row>
                <Row>
                    <Col md={ 5 }>
                        <h3>From</h3>
                        <AccountInfo
                            label="Account address, subject of the recovery"
                            address={ recoveryInfo.accountToRecover.requesterAddress }
                            identity={ recoveryInfo.accountToRecover.userIdentity }
                            postalAddress={ recoveryInfo.accountToRecover.userPostalAddress }
                            otherIdentity={ recoveryInfo.recoveryAccount.userIdentity }
                            otherPostalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                            colorTheme={ colorTheme }
                        />
                    </Col>
                    <Col md={ 1 }>
                        <p className="vertical-center">== RED ARROW ==&gt;</p>
                    </Col>
                    <Col md={ 5 }>
                        <h3>To</h3>
                        <AccountInfo
                            label="Account address where all assets will be transferred"
                            address={ recoveryInfo.recoveryAccount.requesterAddress }
                            identity={ recoveryInfo.recoveryAccount.userIdentity }
                            postalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                            otherIdentity={ recoveryInfo.accountToRecover.userIdentity }
                            otherPostalAddress={ recoveryInfo.accountToRecover.userPostalAddress }
                            colorTheme={ colorTheme }
                        />
                    </Col>
                </Row>
                <Row>
                    <ButtonGroup aria-label="actions">
                        <Button backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                                variant="outline-primary">
                            <Link to={ RECOVERY_REQUESTS_PATH }>Back to requests list</Link>
                        </Button>
                        <Button backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                                variant="outline-danger">Refusal</Button>
                        <Button backgroundColor={ colorTheme.buttons.secondaryBackgroundColor }
                                variant="primary">Process</Button>
                    </ButtonGroup>
                </Row>
            </Frame>
        </FullWidthPane>
    );
}

