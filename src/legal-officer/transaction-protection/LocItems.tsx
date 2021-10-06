import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../../common/Table";
import StatusCell from "../../common/StatusCell";
import LegalOfficerName from "../../common/LegalOfficerNameCell";
import { useLocContext } from "./LocContext";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import React from "react";
import LocPublicDataDetails from "./LocPublicDataDetails";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { POLKADOT } from "../../common/ColorTheme";
import { Child } from "../../common/types/Helpers";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";

export default function LocItems() {

    const { locItems, removeMetadata } = useLocContext();

    if (removeMetadata === null) {
        return null;
    }

    function renderDetails(locItem: LocItem): Child {
        return locItem.type === 'Data' ?
            <LocPublicDataDetails item={ locItem } /> :
            <LocPrivateFileDetails item={ locItem } />
    }

    function renderActions(locItem: LocItem): Child {
        return (
            <ActionCell>
                <ButtonGroup>
                    { locItem.type === 'Data' && <LocPublishPublicDataButton locItem={ locItem } /> }
                    { locItem.type === 'Document' && <LocPublishPrivateFileButton locItem={ locItem } /> }
                    <Button
                        variant="danger"
                        onClick={ () => removeMetadata!(locItem) }
                        data-testid={ `remove-${ locItem.name }` }
                    >
                        X
                    </Button>
                </ButtonGroup>
            </ActionCell>)
    }

    return (
        <Table
            data={ locItems }
            columns={ [
                {
                    header: "Name",
                    render: locItem => <Cell content={ locItem.name } />,
                    renderDetails: locItem => renderDetails(locItem),
                    align: "left",
                    width: "250px"
                },
                {
                    header: "Timestamp",
                    render: locItem => <DateTimeCell dateTime={ locItem.timestamp } />,
                    width: "200px"
                },
                {
                    header: "Type",
                    render: locItem => <Cell content={ locItem.type } />,
                    width: "200px"
                },
                    {
                        header: "Submitted by",
                        render: locItem => <LegalOfficerName address={ locItem.submitter } />
                    },
                    {
                        header: "",
                        render: locItem => {
                            if (locItem.status === 'DRAFT') {
                                return renderActions(locItem)
                            } else {
                                return (<StatusCell text={ locItem.status } color={ POLKADOT } />)
                            }
                        }
                    }
                ] }
                renderEmpty={ () => <EmptyTableMessage>No public data nor private documents
                    yet</EmptyTableMessage> } />
    )
}
