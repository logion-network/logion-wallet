import { useState } from "react";
import HandledVaultTransferRequests from "./HandledVaultTransferRequests";
import PendingVaultTransferRequests from "./PendingVaultTransferRequests";
import RejectedVaultTransferRequests from "./RejectedVaultTransferRequests";

import Tabs from "./Tabs";

export default function VaultTransferRequests() {
    const [ currentTab, setCurrentTab ] = useState("pending");

    return (
        <Tabs
            className="VaultTransferRequests"
            activeKey={ currentTab }
            tabs={[
                {
                    key: "pending",
                    title: "Pending",
                    render: () => <PendingVaultTransferRequests />
                },
                {
                    key: "rejected",
                    title: "Rejected",
                    render: () => <RejectedVaultTransferRequests />
                },
                {
                    key: "history",
                    title: "History",
                    render: () => <HandledVaultTransferRequests />
                }
            ]}
            onSelect={ setCurrentTab }
        />
    );
}
