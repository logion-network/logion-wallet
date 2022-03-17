import { useState } from "react";
import { useCommonContext } from "./CommonContext";
import HandledVaultTransferRequests from "./HandledVaultTransferRequests";
import PendingVaultTransferRequests from "./PendingVaultTransferRequests";
import RejectedVaultTransferRequests from "./RejectedVaultTransferRequests";

import Tabs from "./Tabs";

export default function VaultTransferRequests() {
    const { cancelledVaultTransferRequests } = useCommonContext();
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
                    key: "cancelled",
                    title: "Cancelled",
                    render: () => <HandledVaultTransferRequests requests={ cancelledVaultTransferRequests || [] } decisionOnLabel="Cancellation Date"/>
                }
            ]}
            onSelect={ setCurrentTab }
        />
    );
}
