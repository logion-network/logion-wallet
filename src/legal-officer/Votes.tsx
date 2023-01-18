import { useState } from "react";
import { useCommonContext } from "src/common/CommonContext";
import { FullWidthPane } from "src/common/Dashboard";
import Frame from "src/common/Frame";
import Tabs from "src/common/Tabs";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import VotesTable from "./VotesTable";

export default function Votes() {
    const { colorTheme } = useCommonContext();
    const { votes } = useLegalOfficerContext();
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
                                render: () => <VotesTable votes={votes}/>
                            }
                        ]
                    }
                />
            </Frame>
        </FullWidthPane>
    );
}
