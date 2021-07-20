import { LegalOfficer } from "./types/LegalOfficer";
import Collapsible from "react-collapsible";
import Button from 'react-bootstrap/Button';

export interface Props {
    legalOfficer: LegalOfficer;
}

export default function LegalOfficerInfo(props: Props) {
    const button = <Button>More</Button>;
    return (
        <>
            {props.legalOfficer.name}
            <Collapsible trigger={button}>
                <p>Polkadot address: {props.legalOfficer.address}</p>
                <p>Details: <br/>{props.legalOfficer.details.split(/\n/).map((line, index) => (
                    <span key={ index } >{line}<br/></span>
                ))
                }</p>
            </Collapsible>
        </>
    );
};
