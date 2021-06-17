import React from 'react';
import {useUserContext} from "../UserContext";
import './TrustProtection.css'
import {FullWidthPane} from "../../component/Dashboard";
import ProtectionRequestStatus from "./ProtectionRequestStatus";
import {useRootContext} from "../../RootContext";
import Frame from "../../component/Frame";

export default function TrustProtection() {
    const { addresses, selectAddress } = useRootContext();
    const {colorTheme} = useUserContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            addresses={addresses}
            selectAddress={selectAddress}
        >
            <h1>My Logion Trust Protection</h1>
            <Frame
                colors={ colorTheme }
            >
                <ProtectionRequestStatus/>
            </Frame>
        </FullWidthPane>
    );
}
