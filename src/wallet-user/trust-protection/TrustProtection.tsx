import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from "react-bootstrap/Button";

import {TRUST_PROTECTION_PATH} from "../UserRouter";

import { useUserContext } from "../UserContext";
import { Link } from 'react-router-dom';

import './TrustProtection.css'

export default function TrustProtection() {
    const { recoveryConfig } = useUserContext();
    const checkingTrustProtection = recoveryConfig === null;

    return (
        <div className="TrustProtection">
            <h1>My Trust Protection</h1>
            {
                checkingTrustProtection &&
                <Alert variant="info">
                    <p>Checking your trust protection...</p>
                </Alert>
            }
            {
                !checkingTrustProtection &&
                <Link to={TRUST_PROTECTION_PATH}>
                    <Button>
                        Show me
                    </Button>
                </Link>
            }
        </div>
    );
}
