import React, { useCallback, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';

import { useLogionChain, Unsubscriber, ISubmittableResult, replaceUnsubscriber, isFinalized } from '../../logion-chain';
import { createRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmissionResult from '../../legal-officer/ExtrinsicSubmissionResult';
import { useRootContext } from '../../RootContext';

import {useUserContext} from "../UserContext";
import {legalOfficerByAddress} from "./Model";
import {ProtectionRequest} from "../../legal-officer/Types";

import LegalOfficerInfo from "../../component/LegalOfficerInfo";

export default function RequestActivating() {
    const { api } = useLogionChain();
    const { currentAddress } = useRootContext();
    const { acceptedProtectionRequests, refreshRequests } = useUserContext();
    const [ activationResult, setActivationResult ] = useState<ISubmittableResult | null>(null);
    const [ activationError, setActivationError ] = useState<any>(null);
    const [ activationUnsubscriber, setActivationUnsubscriber ] = useState<Unsubscriber | null>(null);
    const [ refreshedAfterActivation, setRefreshedAfterActivation ] = useState<boolean>(false);

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

    useEffect(() => {
        if(isFinalized(activationResult) && !refreshedAfterActivation) {
            setRefreshedAfterActivation(true);
            refreshRequests!();
        }
    }, [ activationResult, refreshedAfterActivation, setRefreshedAfterActivation, refreshRequests ]);

    const createdProtectionRequest: ProtectionRequest = acceptedProtectionRequests![0];

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
}
