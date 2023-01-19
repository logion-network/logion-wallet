import { useMemo } from "react";
import { Cell } from "src/common/Table";
import { Vote } from "../client";

export interface Props {
    vote: Vote;
}

export default function VoteDetails(props: Props) {
    const counts = useMemo(() => {
        const voteResults = Object.values(props.vote.ballots);
        let votedYes = 0;
        let votedNo = 0;
        for(const voteResult of voteResults) {
            if(voteResult === "Yes") {
                ++votedYes;
            } else {
                ++votedNo;
            }
        }
        return { votedYes, votedNo };
    }, [props.vote]);

    return <Cell content={`${counts.votedYes}/${counts.votedYes + counts.votedNo}`}/>;
}
