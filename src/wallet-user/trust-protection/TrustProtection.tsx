import React from 'react';
import {useUserContext} from "../UserContext";
import './TrustProtection.css'
import {ContentPane} from "../../component/Dashboard";
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
        <ContentPane
            addresses={addresses}
            selectAddress={selectAddress}
            colors={ colorTheme }
            primaryAreaChildren={
                <>
                    <h1>My Logion Trust Protection</h1>
                    <Frame
                        colors={ colorTheme.frame }
                    >
                        <ProtectionRequestStatus/>
                    </Frame>
                </>
            }/>
    );
}
