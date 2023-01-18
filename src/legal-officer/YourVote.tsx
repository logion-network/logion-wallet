import { useCallback, useMemo, useState } from "react";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import Icon from "src/common/Icon";
import { useLogionChain } from "src/logion-chain";
import { Vote, VoteResult } from "./client";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import "./YourVote.css";

export interface Props {
    vote: Vote;
}

export default function YourVote(props: Props) {
    const { accounts } = useLogionChain();
    const { vote } = useLegalOfficerContext();
    const [ call, setCall ] = useState<Call>();

    const yourVoteResult = useMemo(() => {
        if(accounts?.current?.address) {
            const currentAddress = accounts?.current?.address;
            return props.vote.ballots[currentAddress];
        }
    }, [ props.vote, accounts ]);

    const voteCallback = useCallback(async (myVote: VoteResult, callback: CallCallback) => {
        await vote({
            targetVote: props.vote,
            myVote,
            callback,
        })
    }, [ vote, props.vote ]);

    const voteYesCallback = useCallback(async (callback: CallCallback) => {
        await voteCallback("Yes", callback);
    }, [ voteCallback ]);

    const voteNoCallback = useCallback(async (callback: CallCallback) => {
        await voteCallback("No", callback);
    }, [ voteCallback ]);

    if(call !== undefined) {
        return (
            <ClientExtrinsicSubmitter
                call={ call }
                onSuccess={ () => setCall(undefined) }
                slim
            />
        );
    } else if(!yourVoteResult) {
        return (
            <ButtonGroup>
                <Button
                    onClick={ () => setCall(() => voteYesCallback) }
                    variant="none"
                >
                    <Icon icon={{id: "ok"}} height='40px' />
                </Button>
                <Button
                    onClick={ () => setCall(() => voteNoCallback) }
                    variant="none"
                >
                    <Icon icon={{id: "ko"}} height='40px' />
                </Button>
            </ButtonGroup>
        );
    } else {
        return (
            <div className="YourVote">
                <Icon icon={{id: "lock_black"}} height='40px' />
                { yourVoteResult === "Yes" && <Icon icon={{id: "ok"}} height='40px' /> }
                { yourVoteResult === "No" && <Icon icon={{id: "ko"}} height='40px' /> }
            </div>
        );
    }
}
