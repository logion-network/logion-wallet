import React from 'react';
import Button from "react-bootstrap/Button";
import {TRUST_PROTECTION_PATH} from "../UserRouter";
import { Link } from 'react-router-dom';

export default function TrustProtection() {
    return (
        <>
            <h1>My Trust Protection</h1>
            <Link to={TRUST_PROTECTION_PATH}>
                <Button>
                    Activate my Logion Trust Protection
                </Button>
            </Link>
        </>
    );
}
