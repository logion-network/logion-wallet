import React from 'react';
import {useUserContext} from "../UserContext";
import {FullWidthPane} from "../../component/Dashboard";
import RecoveryStatus from "./RecoveryStatus";
import Frame from "../../component/Frame";

export default function Recovery() {
    const {colorTheme} = useUserContext();

    return (
        <FullWidthPane>
            <h1>Recovery Process</h1>
            <Frame
                colors={ colorTheme }
            >
                <RecoveryStatus/>
            </Frame>
        </FullWidthPane>
    );
}
