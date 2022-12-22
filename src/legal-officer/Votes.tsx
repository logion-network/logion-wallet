import { Link } from "react-router-dom";
import { useCommonContext } from "src/common/CommonContext";
import { FullWidthPane } from "src/common/Dashboard";
import Frame from "src/common/Frame";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { voteLocPath } from "./LegalOfficerPaths";

export default function Votes() {
    const { colorTheme } = useCommonContext();
    const { votes } = useLegalOfficerContext();

    return (
        <FullWidthPane
            mainTitle={ "Votes" }
            titleIcon={ {
                icon: {
                    id: "identity"
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="Votes"
        >
            <Frame>
                <Table
                    columns={[
                        {
                            header: "ID",
                            render: vote => <Cell content={ vote.voteId }/>,
                        },
                        {
                            header: "Creation date",
                            render: vote => <DateTimeCell dateTime={ vote.createdOn }/>,
                        },
                        {
                            header: "LOC",
                            render: vote => <Cell content={
                                <Link
                                    to={ voteLocPath(vote.locId) }
                                >
                                    { vote.locId.toDecimalString() }
                                </Link>
                            }/>
                        }
                    ]}
                    data={ votes }
                    renderEmpty={ () => <EmptyTableMessage>No vote to display</EmptyTableMessage> }
                />
            </Frame>
        </FullWidthPane>
    );
}
