import { useMemo } from "react";
import { Link } from "react-router-dom";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import { Vote } from "../client";
import { voteLocPath } from "../LegalOfficerPaths";
import YourVote from "./YourVote";

export interface Props {
    votes: Vote[];
}

export default function PendingVotesTable(props: Props) {

    const pendingVotes = useMemo(() => {
        return props.votes.filter(vote => vote.status === "PENDING");
    }, [ props.votes ]);

    return (
        <Table
            columns={[
                {
                    header: "ID",
                    render: vote => <Cell content={ vote.voteId }/>,
                    width: "150px",
                },
                {
                    header: "Creation date",
                    render: vote => <DateTimeCell dateTime={ vote.createdOn }/>,
                    width: "150px",
                },
                {
                    header: "LOC",
                    render: vote => <Cell content={
                        <Link
                            to={ voteLocPath(vote.locId) }
                        >
                            { vote.locId.toDecimalString() }
                        </Link>
                    } overflowing/>
                },
                {
                    header: "Description",
                    render: vote => <Cell
                        content="Non-Collator Logion Guardian nomination vote"
                        overflowing
                        tooltipId={`${vote.voteId}-loc-id-tt`}
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
