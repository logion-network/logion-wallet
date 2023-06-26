import { useMemo } from "react";
import { Link } from "react-router-dom";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import { voteLocPath } from "../LegalOfficerPaths";
import YourVote from "./YourVote";
import { useLegalOfficerContext } from "../LegalOfficerContext";

export default function PendingVotesTable() {
    const { votes } = useLegalOfficerContext();

    const pendingVotes = useMemo(() => {
        if(votes) {
            return votes.votes.filter(vote => vote.data.status === "PENDING");
        } else {
            return [];
        }
    }, [ votes ]);

    return (
        <Table
            columns={[
                {
                    header: "ID",
                    render: vote => <Cell content={ vote.data.voteId }/>,
                    width: "150px",
                },
                {
                    header: "Creation date",
                    render: vote => <DateTimeCell dateTime={ vote.data.createdOn }/>,
                    width: "150px",
                },
                {
                    header: "LOC",
                    render: vote => <Cell content={
                        <Link
                            to={ voteLocPath(vote.data.locId) }
                        >
                            { vote.data.locId.toDecimalString() }
                        </Link>
                    } overflowing/>
                },
                {
                    header: "Description",
                    render: vote => <Cell
                        content="Non-Collator Logion Legal Officer nomination vote"
                        overflowing
                        tooltipId={`${vote.data.voteId}-loc-id-tt`}
                    />,
                },
                {
                    header: "Your Vote",
                    render: vote => <YourVote vote={vote}/>,
                }
            ]}
            data={ pendingVotes }
            renderEmpty={ () => <EmptyTableMessage>No pending vote to display</EmptyTableMessage> }
        />
    );
}
