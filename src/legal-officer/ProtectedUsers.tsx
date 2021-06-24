import React from 'react';
import { Table } from "react-bootstrap";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import UserInfo from "../component/UserInfo";
import LegalOfficerInfo from "../component/LegalOfficerInfo";
import { useRootContext } from "../RootContext";
import { legalOfficerByAddress } from "../wallet-user/trust-protection/Model";

export default function ProtectedUsers() {
    const { activatedProtectionRequests } = useLegalOfficerContext();
    const { currentAddress } = useRootContext();

    return (
            <>
                <Table striped bordered responsive>
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Other Legal Officer</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        activatedProtectionRequests?.map(request => {
                            const otherLegalOfficerAddress = request.decisions
                                    .map(decision => decision.legalOfficerAddress)
                                    .find(legalOfficerAddress => legalOfficerAddress !== currentAddress);
                            return (
                                    <tr key={request.id}>
                                        <td>
                                            <UserInfo
                                                    address={request.requesterAddress}
                                                    userIdentity={request.userIdentity}
                                                    postalAddress={request.userPostalAddress}/>
                                        </td>
                                        <td>
                                            {otherLegalOfficerAddress !== undefined &&
                                            <LegalOfficerInfo
                                                    legalOfficer={legalOfficerByAddress(otherLegalOfficerAddress)}/>
                                            }
                                        </td>
                                    </tr>
                            )
                        })
                    }
                    </tbody>
                </Table>
            </>
    );
}
