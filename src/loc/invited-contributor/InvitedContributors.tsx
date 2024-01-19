import { Row } from "react-bootstrap";
import ButtonGroup from "../../common/ButtonGroup";
import { InvitedContributorButton } from "./InvitedContributorButton";
import { Viewer } from "../../common/CommonContext";
import { LocData } from "@logion/client";
import Table, { EmptyTableMessage, Cell } from "../../common/Table";

export interface Props {
    collection: LocData;
    viewer: Viewer;
}

export function InvitedContributors(props: Props) {
    const { collection } = props;
    return (
        <div>
            <Row>
                <Table
                    hideHeader={ true }
                    columns={ [
                        {
                            header: "",
                            render: invitedContributor => <Cell content={ invitedContributor.address } />,
                            align: "left",
                        },
                        {
                            header: "",
                            render: invitedContributor => <>
                                { canChangeInvitedContributors(props) &&
                                    <ButtonGroup>
                                        <InvitedContributorButton
                                            removeContributor={ invitedContributor } />
                                    </ButtonGroup>
                                }
                            </>,
                            width: "200px"
                        }
                    ] }
                    data={ collection.invitedContributors }
                    renderEmpty={ () => <EmptyTableMessage>There are no invited contributors</EmptyTableMessage> }
                />
                { canChangeInvitedContributors(props) &&
                    <ButtonGroup align="left">
                        <InvitedContributorButton />
                    </ButtonGroup>
                }
            </Row>
        </div>
    )
}

function canChangeInvitedContributors(props: Props): boolean {
    const { collection, viewer } = props;
    return viewer === "User"
        && collection.voidInfo === undefined
        && (collection.status === "OPEN" || collection.status === "CLOSED");
}
