import React from 'react';
import { Table } from "react-bootstrap";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import UserInfo from "../common/UserInfo";
import LegalOfficerInfo from "../common/LegalOfficerInfo";
import { legalOfficerByAddress } from "../common/types/LegalOfficer";

export default function ProtectedUsers() {
    const { activatedProtectionRequests } = useLegalOfficerContext();

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
                            const otherLegalOfficerAddress = request.otherLegalOfficerAddress;
                            return (
                                    <tr key={request.id}>
                                        <td>
                                            <UserInfo
                                                    address={request.requesterAddress}
                                                    userIdentity={request.userIdentity}
                                                    postalAddress={request.userPostalAddress}/>
                                        </td>
                                        <td>
                                            <LegalOfficerInfo
                                                legalOfficer={legalOfficerByAddress(otherLegalOfficerAddress)}
                                            />
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
