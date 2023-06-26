import { Vote } from "@logion/client";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "src/common/Icon";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import Accounts from "src/common/types/Accounts";
import { Child, Children } from "src/common/types/Helpers";
import { useLogionChain } from "src/logion-chain";
import { voteLocPath } from "../LegalOfficerPaths";
import VoteDetails from "./VoteDetails";
import { useLegalOfficerContext } from "../LegalOfficerContext";

export default function ClosedVotesTable() {
    const { accounts } = useLogionChain();
    const { votes } = useLegalOfficerContext();

    const closedVotes = useMemo(() => {
        if(votes) {
            return votes.votes.filter(vote => vote.data.status !== "PENDING");
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
                    header: "Your vote",
                    render: vote => <Cell content={yourVoteIcon(vote, accounts)}/>,
                    width: "150px",
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
    const result = vote.data.ballots[currentAddress || ""];
    if(result === "Yes") {
        return <Icon icon={{id:"ok"}}/>;
    } else {
        return <Icon icon={{id:"ko"}}/>;
    }
}

function voteResultIcon(vote: Vote): Child {
    if(vote.data.status === "APPROVED") {
        return <Icon icon={{id:"ok"}} height="40px"/>;
    } else {
        return <Icon icon={{id:"ko"}} height="40px"/>;
    }
}
