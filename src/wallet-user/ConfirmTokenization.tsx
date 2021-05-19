import React from 'react';
import {useUserContext} from "./UserContext";

export default function ConfirmTokenization() {
    const {createdTokenRequest} = useUserContext();

    if (createdTokenRequest === null) {
        return null;
    }

    return (
        <p>
            Your request ({createdTokenRequest.id}) has been sent to your legal officer.
        </p>
    )
}
