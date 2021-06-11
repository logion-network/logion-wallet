import React from 'react';

import MyTokens from './MyTokens';
import TrustProtection from "./trust-protection/TrustProtection";
import TokenizationRequests from "./TokenizationRequests";

export default function Account() {
    return (
        <>
            <TrustProtection />
            <MyTokens />
            <TokenizationRequests />
        </>
    );
}
