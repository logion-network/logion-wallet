import { UserIdentity } from '@logion/client';
import { Cell } from './Table';

export interface Props {
    userIdentity?: UserIdentity;
}

export default function UserIdentityNameCell(props: Props) {

    return (
        <Cell
            content={ `${props.userIdentity?.firstName} ${props.userIdentity?.lastName}` }
        />
    );
}
