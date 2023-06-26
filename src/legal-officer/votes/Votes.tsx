import { useState } from "react";
import { useCommonContext } from "src/common/CommonContext";
import { FullWidthPane } from "src/common/Dashboard";
import Frame from "src/common/Frame";
import Tabs from "src/common/Tabs";
import ClosedVotesTable from "./ClosedVotesTable";
import PendingVotesTable from "./PendingVotesTable";

export default function Votes() {
    const { colorTheme } = useCommonContext();
    const [ currentTab, setCurrentTab ] = useState("pending");

    return (
        <FullWidthPane
            mainTitle={ "Votes" }
            titleIcon={ {
                icon: {
                    id: "vote"
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="Votes"
        >
            <Frame>
                <Tabs
                    activeKey={currentTab}
                    onSelect={tab => setCurrentTab(tab)}
                    tabs={
                        [
                            {
                                key: "pending",
                                title: "Pending",
                                render: () => <PendingVotesTable/>
                            },
                            {
                                key: "closed",
                                title: "Closed (results)",
                                render: () => <ClosedVotesTable/>
                            }
                        ]
                    }
                />
            </Frame>
        </FullWidthPane>
    );
}
