import { FullWidthPane } from "../../common/Dashboard";
import { useCommonContext } from "../../common/CommonContext";
import Frame from "../../common/Frame";
import Tabs from "../../common/Tabs";
import { useState } from "react";
import IssuerOpenedLocs from "./IssuerOpenedLocs";
import IssuerClosedLocs from "./IssuerClosedLocs";
import IssuerInfo from "./IssuerInfo";

export default function IssuerDashboard() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    return (
        <FullWidthPane
            className="IssuerDashboard"
            mainTitle={ "Verified Issuer LOC Management" }
            titleIcon={ {
                icon: {
                    id: 'issuer-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <IssuerInfo/>
            <Frame title="Verified Issuer LOC list">
                <Tabs
                    activeKey={ locTabKey }
                    onSelect={ key => setLocTabKey(key || 'open') }
                    tabs={ [
                        {
                            key: "open",
                            title: "Open",
                            render: () => <IssuerOpenedLocs/>
                        },
                        {
                            key: "closed",
                            title: "Closed",
                            render: () => <IssuerClosedLocs/>
                        },
                    ] }
                />
            </Frame>
        </FullWidthPane>
    );
}
