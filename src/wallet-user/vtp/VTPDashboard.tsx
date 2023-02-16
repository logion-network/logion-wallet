import { FullWidthPane } from "../../common/Dashboard";
import { useCommonContext } from "../../common/CommonContext";
import Frame from "../../common/Frame";
import Tabs from "../../common/Tabs";
import { useState } from "react";
import VTPOpenedLocs from "./VTPOpenedLocs";
import VTPClosedLocs from "./VTPClosedLocs";
import VTPInfo from "./VTPInfo";

export default function VTPDashboard() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    return (
        <FullWidthPane
            className="VTPDashboard"
            mainTitle={ "Third Party LOC Management" }
            titleIcon={ {
                icon: {
                    id: 'vtp-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <VTPInfo/>
            <Frame title="Third party LOC list">
                <Tabs
                    activeKey={ locTabKey }
                    onSelect={ key => setLocTabKey(key || 'open') }
                    tabs={ [
                        {
                            key: "open",
                            title: "Open",
                            render: () => <VTPOpenedLocs/>
                        },
                        {
                            key: "closed",
                            title: "Closed",
                            render: () => <VTPClosedLocs/>
                        },
                    ] }
                />
            </Frame>
        </FullWidthPane>
    );
}
