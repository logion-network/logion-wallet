import { UUID } from '@logion/node-api/dist/UUID';

import { CopyPasteCell } from './Table';
import { LocRequestStatus } from './types/ModelTypes';

export interface Props {
    status: LocRequestStatus;
    id: string | UUID;
}

export default function LocIdCell(props: Props) {
    const locId: UUID = props.id instanceof UUID ? props.id : new UUID(props.id);
    let content: string;
    if(props.status === 'OPEN' || props.status === 'CLOSED') {
        content = locId.toDecimalString();
    } else {
        content = "-";
    }

    return (
        <CopyPasteCell
            overflowing
            tooltipId={ `locId-${ props.id }` }
            content={ content }
        />
    );
}
