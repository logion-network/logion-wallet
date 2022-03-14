import { useState } from "react";
import { useCommonContext } from "./CommonContext";
import HandledVaultTransferRequests from "./HandledVaultTransferRequests";
import PendingVaultTransferRequests from "./PendingVaultTransferRequests";

import Tabs from "./Tabs";

export default function VaultTransferRequests() {
    const { cancelledVaultTransferRequests, rejectedVaultTransferRequests } = useCommonContext();
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
                    render: () => <HandledVaultTransferRequests requests={ rejectedVaultTransferRequests || [] } />
                },
                {
                    key: "cancelled",
                    title: "Cancelled",
                    render: () => <HandledVaultTransferRequests requests={ cancelledVaultTransferRequests || [] } />
                }
            ]}
            onSelect={ setCurrentTab }
        />
    );
}
