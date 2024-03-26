import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import { FullWidthPane } from "../../common/Dashboard";
import Tabs from "../../common/Tabs";
import PendingVaultTransferRequests from "./PendingVaultTransferRequests";
import VaultTransferRequestsHistory from "./VaultTransferRequestsHistory";

export default function VaultOutRequests() {
    const [ currentTab, setCurrentTab ] = useState('pending');

    return (
        <FullWidthPane
            mainTitle="Vault withdrawal request management"
            titleIcon={ {
                icon: {
                    id: "vault-big"
                }
            } }
            className="TransactionProtection"
        >
            <Row>
                <Col>
                    <Tabs
                        activeKey={ currentTab }
                        onSelect={ key => setCurrentTab(key || 'pending') }
                        tabs={[
                            {
                                key: "pending",
                                title: "Pending",
                                render: () => <PendingVaultTransferRequests />
                            },
                            {
                                key: "history",
                                title: "History",
                                render: () => <VaultTransferRequestsHistory />
                            }
                        ]}
                    />
                </Col>
            </Row>
        </FullWidthPane>
    );
}
