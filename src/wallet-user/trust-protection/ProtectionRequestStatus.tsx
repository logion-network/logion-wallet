import React, { useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import { useLogionChain, Unsubscriber, ISubmittableResult, replaceUnsubscriber } from '../../logion-chain';
import { createRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmissionResult from '../../legal-officer/ExtrinsicSubmissionResult';

import {useUserContext} from "../UserContext";
import {legalOfficerName} from "./Model";
import {ProtectionRequest} from "../../legal-officer/Types";
import { ACCOUNT_PATH } from '../UserRouter';

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";

export default function ProtectionRequestStatus() {
    const { api } = useLogionChain();
    const { userAddress, pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig, refreshRequests } = useUserContext();
    const [ activationResult, setActivationResult ] = useState<ISubmittableResult | null>(null);
    const [ activationError, setActivationError ] = useState<any>(null);
    const [ activationUnsubscriber, setActivationUnsubscriber ] = useState<Unsubscriber | null>(null);

    const activateProtection = useCallback((request: ProtectionRequest) => {
        setActivationResult(null);
        setActivationError(null);
        (async function() {
            const unsubscriber = createRecovery({
                api: api!,
                signerId: userAddress,
                callback: setActivationResult,
                errorCallback: setActivationError,
                legalOfficers: request.decisions.map(decision => decision.legalOfficerAddress),
            });
            await replaceUnsubscriber(activationUnsubscriber, setActivationUnsubscriber, unsubscriber);
            refreshRequests!();
        })();
    }, [ api, userAddress, refreshRequests, activationUnsubscriber, setActivationUnsubscriber ]);

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null) {
        return null;
    }

    if(pendingProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = pendingProtectionRequests[0];

        return (
            <>
                <h1>Protection request status</h1>
                <p>
                    Your Logion Trust Protection request ({createdProtectionRequest.id}) has been submitted. A Legal Officer
                    will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                    completion of one of your Legal Officer approval processes, you will be able to use all features
                    provided by your logion account dashboard.
                </p>
                <ul>
                {
                    createdProtectionRequest.decisions.map(decision => (
                        <li key={decision.legalOfficerAddress}>
                            {legalOfficerName(decision.legalOfficerAddress)} ({decision.legalOfficerAddress}):
                            &bnsp;{decision.status}
                        </li>
                    ))
                }
                </ul>
                <Link to={ ACCOUNT_PATH }>Back to account</Link>
            </>
        );
    } else if(acceptedProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = acceptedProtectionRequests[0];

        if(recoveryConfig!.isEmpty) {
            return (
                <>
                    <h1>Protection request status</h1>
                    <p>
                        Your Logion Trust Protection request ({createdProtectionRequest.id}) has been accepted by your
                        Legal Officers. You can now activate your protection.
                    </p>
                    {
                        activationResult === null &&
                        <p>
                            <Button onClick={() => activateProtection(createdProtectionRequest)}>Activate</Button>
                        </p>
                    }
                    {
                        (activationResult !== null || activationError !== null) &&
                        <ExtrinsicSubmissionResult
                            result={activationResult}
                            error={activationError}
                            successMessage="Protection successfully activated."
                        />
                    }
                    <Link to={ ACCOUNT_PATH }>Back to account</Link>
                </>
            );
        } else {
            return (
                <>
                    <h1>Protection request status</h1>
                    <p>
                        Your Logion Trust Protection is active. You are now protected by
                    </p>
                    <ul>
                    {
                        createdProtectionRequest.decisions.map(decision => (
                            <li key={decision.legalOfficerAddress}>
                                {legalOfficerName(decision.legalOfficerAddress)} ({decision.legalOfficerAddress})
                            </li>
                        ))
                    }
                    </ul>
                    <Link to={ ACCOUNT_PATH }>Back to account</Link>
                </>
            );
        }
    } else {
        return <CreateProtectionRequestForm />;
    }
}
