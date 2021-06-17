import React, {useCallback, useState} from 'react';
import Button from 'react-bootstrap/Button';

import { useLogionChain, Unsubscriber, ISubmittableResult, replaceUnsubscriber } from '../../logion-chain';
import { createRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmissionResult from '../../legal-officer/ExtrinsicSubmissionResult';
import { useRootContext } from '../../RootContext';

import {useUserContext} from "../UserContext";
import {legalOfficerByAddress} from "./Model";
import {ProtectionRequest} from "../../legal-officer/Types";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import LegalOfficerInfo from "../../component/LegalOfficerInfo";

export default function ProtectionRequestStatus() {
    const { api } = useLogionChain();
    const { currentAddress } = useRootContext();
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig, refreshRequests } = useUserContext();
    const [ activationResult, setActivationResult ] = useState<ISubmittableResult | null>(null);
    const [ activationError, setActivationError ] = useState<any>(null);
    const [ activationUnsubscriber, setActivationUnsubscriber ] = useState<Unsubscriber | null>(null);

    const activateProtection = useCallback((request: ProtectionRequest) => {
        setActivationResult(null);
        setActivationError(null);
        (async function() {
            const unsubscriber = createRecovery({
                api: api!,
                signerId: currentAddress,
                callback: setActivationResult,
                errorCallback: setActivationError,
                legalOfficers: request.decisions.map(decision => decision.legalOfficerAddress),
            });
            await replaceUnsubscriber(activationUnsubscriber, setActivationUnsubscriber, unsubscriber);
            refreshRequests!();
        })();
    }, [ api, currentAddress, refreshRequests, activationUnsubscriber, setActivationUnsubscriber ]);

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null) {
        return null;
    }

    if(pendingProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = pendingProtectionRequests[0];

        return (
            <>
                <h2>Protection request status</h2>
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
                            {legalOfficerByAddress(decision.legalOfficerAddress).name} ({decision.legalOfficerAddress}): {decision.status}
                        </li>
                    ))
                }
                </ul>
            </>
        );
    } else if(acceptedProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = acceptedProtectionRequests[0];

        if(recoveryConfig!.isEmpty) {
            return (
                <>
                    <h2>My Legal Officers</h2>
                    <p>
                        Your Logion Trust Protection request ({createdProtectionRequest.id}) has been accepted by your
                        Legal Officers. You can now activate your protection.
                    </p>
                    <ul>
                        {
                            createdProtectionRequest.decisions
                                .map(decision => {
                                    const legalOfficer = legalOfficerByAddress(decision.legalOfficerAddress);
                                    return (
                                        <li key={legalOfficer.address}>
                                            <LegalOfficerInfo legalOfficer={legalOfficer}/>
                                        </li>
                                    );
                                })
                        }
                    </ul>
                    {
                        activationResult === null &&
                        <p>
                            <Button data-testid="btnActivate" onClick={() => activateProtection(createdProtectionRequest)}>Activate</Button>
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
                </>
            );
        } else {
            return (
                <>
                    <h2>My Legal Officers</h2>
                    <p>
                        Your Logion Trust Protection is active. You are now protected by
                    </p>
                    <ul>
                        {
                            createdProtectionRequest.decisions
                                .map(decision => {
                                    const legalOfficer = legalOfficerByAddress(decision.legalOfficerAddress);
                                    return (
                                        <li key={legalOfficer.address}>
                                            <LegalOfficerInfo legalOfficer={legalOfficer}/>
                                        </li>
                                    );
                                })
                        }
                    </ul>
                </>
            );
        }
    } else {
        return <CreateProtectionRequestForm />;
    }
}
