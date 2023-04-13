import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "src/common/Icon";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import Accounts from "src/common/types/Accounts";
import { Child, Children } from "src/common/types/Helpers";
import { useLogionChain } from "src/logion-chain";
import { Vote } from "../client";
import { voteLocPath } from "../LegalOfficerPaths";
import VoteDetails from "./VoteDetails";

export interface Props {
    votes: Vote[];
}

export default function ClosedVotesTable(props: Props) {
    const { accounts } = useLogionChain();

    const closedVotes = useMemo(() => {
        return props.votes.filter(vote => vote.status !== "PENDING");
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
                    header: "Your vote",
                    render: vote => <Cell content={yourVoteIcon(vote, accounts)}/>,
                    width: "150px",
                },
                {
                    header: "Description",
                    render: vote => <Cell
                        content="Non-Collator Logion Legal Officer nomination vote"
                        overflowing
                        tooltipId={`${vote.voteId}-loc-id-tt`}
                    />,
                },
                {
                    header: "Vote Result",
                    render: vote => voteResultIcon(vote),
                    width: "150px",
                },
                {
                    header: "Details",
                    render: vote => <VoteDetails vote={vote}/>,
                    width: "150px",
                }
            ]}
            data={ closedVotes }
            renderEmpty={ () => <EmptyTableMessage>No closed vote to display</EmptyTableMessage> }
        />
    );
}

function yourVoteIcon(vote: Vote, accounts: Accounts | null): Children {
    const currentAddress = accounts?.current?.accountId.address;
    const result = vote.ballots[currentAddress || ""];
    if(result === "Yes") {
        return <Icon icon={{id:"ok"}}/>;
    } else {
        return <Icon icon={{id:"ko"}}/>;
    }
}

function voteResultIcon(vote: Vote): Child {
    if(vote.status === "APPROVED") {
        return <Icon icon={{id:"ok"}} height="40px"/>;
    } else {
        return <Icon icon={{id:"ko"}} height="40px"/>;
    }
}
