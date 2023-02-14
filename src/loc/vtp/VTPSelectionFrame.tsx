import { useLocContext } from "../LocContext";
import { useState, useEffect } from "react";
import { getVerifiedThirdPartySelections, VerifiedThirdPartyWithSelect } from "../../legal-officer/client";
import { OpenLoc } from "@logion/client";
import Table, { EmptyTableMessage, Cell, ActionCell } from "../../common/Table";
import ButtonGroup from "../../common/ButtonGroup";
import Frame from "../../common/Frame";
import './VTPSelectionFrame.css';
import VTPSelectionCheckbox from "./VTPSelectionCheckbox";
import Button from "../../common/Button";
import { identityLocDetailsPath } from "../../legal-officer/LegalOfficerPaths";
import { useCommonContext } from "../../common/CommonContext";

export default function VTPSelectionFrame() {

    const { locState } = useLocContext();
    const [ vtpSelections, setVtpSelections ] = useState<VerifiedThirdPartyWithSelect[]>([]);
    const { colorTheme } = useCommonContext();

    useEffect(() => {
        if (locState !== null && locState instanceof OpenLoc) {
            getVerifiedThirdPartySelections({ locState })
                .then(setVtpSelections)
        }
    }, [ locState ]);

    return (
        <Frame
            className="VTPSelectionFrame"
            title="Verified Third Party management for this LOC"
            titleIcon={ {
                icon: {
                    id: 'vtp-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <Table
                columns={ [
                    {
                        header: "First Name",
                        render: vtp => <Cell content={ vtp.firstName } />,
                        align: 'left'
                    },
                    {
                        header: "Last Name",
                        render: vtp => <Cell content={ vtp.lastName } />,
                        align: 'left'
                    },
                    {
                        header: "Identity LOC",
                        render: vtp =>
                            <ActionCell>
                                <ButtonGroup>
                                    <Button
                                        onClick={ () => window.open(identityLocDetailsPath(vtp.identityLocId), "_blank") }>
                                        View
                                    </Button>
                                </ButtonGroup>
                            </ActionCell>
                    },
                    {
                        header: "Selected ?",
                        render: vtp =>
                            <ActionCell>
                                <ButtonGroup>
                                    <VTPSelectionCheckbox vtpSelection={ vtp } />
                                </ButtonGroup>
                            </ActionCell>
                    },
                ] }
                data={ vtpSelections }
                renderEmpty={ () => <EmptyTableMessage>No Verified Third Parties</EmptyTableMessage> }
            />
        </Frame>
    )
}
