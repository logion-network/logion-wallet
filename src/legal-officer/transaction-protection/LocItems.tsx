import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../../common/Table";
import LegalOfficerName from "../../common/LegalOfficerNameCell";
import { useLocContext } from "./LocContext";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import React from "react";
import LocItemDetails from "./LocItemDetails";
import LocConfirmPublish from "./LocConfirmPublish";

export default function LocItems() {

    const { locItems, publishMetadata, removeMetadata } = useLocContext();

    if (publishMetadata === null || removeMetadata === null) {
        return null;
    }

    return (
            <Table
                data={ locItems }
                columns={ [
                    {
                        header: "Name",
                        render: locItem => <Cell content={ locItem.name } />,
                        renderDetails: locItem => <LocItemDetails item={ locItem } />
                    },
                    {
                        header: "Timestamp",
                        render: locItem => <DateTimeCell dateTime={ locItem.timestamp } />
                    },
                    {
                        header: "Type",
                        render: locItem => locItem.type
                    },
                    {
                        header: "Submitted by",
                        render: locItem => <LegalOfficerName address={ locItem.submitter } />
                    },
                    {
                        header: "Status",
                        render: locItem => {
                            if (locItem.status === 'DRAFT') {
                                return (
                                    <ActionCell>
                                        <ButtonGroup>
                                            <LocConfirmPublish locItem={ locItem } />
                                            <Button
                                                variant="danger"
                                                onClick={ () => removeMetadata(locItem) }
                                                data-testid={ `remove-${ locItem.name }` }
                                            >
                                                X
                                            </Button>
                                        </ButtonGroup>
                                    </ActionCell>)
                            } else {
                                return (<Cell content={ locItem.status } />)
                            }
                        }
                    }
                ] }
                renderEmpty={ () => <EmptyTableMessage>No public data nor private documents
                    yet</EmptyTableMessage> } />
    )
}
