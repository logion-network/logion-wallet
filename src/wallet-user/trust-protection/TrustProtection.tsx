import React from 'react';
import {useUserContext} from "../UserContext";
import './TrustProtection.css'
import {FullWidthPane} from "../../component/Dashboard";
import ProtectionRequestStatus from "./ProtectionRequestStatus";
import Frame from "../../component/Frame";

export default function TrustProtection() {
    const {colorTheme} = useUserContext();

    return (
        <FullWidthPane>
            <h1>My Logion Trust Protection</h1>
            <Frame
                colors={ colorTheme }
            >
                <ProtectionRequestStatus/>
            </Frame>
        </FullWidthPane>
    );
}
