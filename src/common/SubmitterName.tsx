import { UserIdentity } from "@logion/client";
import { Cell } from "./Table";

export interface Props {
    identity?: UserIdentity,
}

export default function SubmitterName(props: Props) {
    const { identity } = props;
    const content = identity ? identity.firstName + " " + identity.lastName : "!! Unknown submitter !!"
    return (
        <Cell
            content={ content }
        />
    );
}
