import { useLogionChain } from '../logion-chain';
import { Cell } from './Table';

export interface Props {
    address: string;
}

export default function LegalOfficerName(props: Props) {
    const { getOfficer } = useLogionChain();

    if(getOfficer === undefined) {
        return null;
    }

    const legalOfficer = getOfficer(props.address);
    let content: string;
    if(!legalOfficer) {
        content = "!! UNKNOWN LEGAL OFFICER !!";
    } else {
        content = legalOfficer.name;
    }

    return (
        <Cell
            content={ content }
        />
    );
}
