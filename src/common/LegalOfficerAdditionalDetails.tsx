import './LegalOfficerAdditionalDetails.css';

export interface Props {
    additionalDetails?: string;
}

export default function LegalOfficerAdditionalDetails(props: Props) {
    if(!props.additionalDetails) {
        return null;
    }
    return (
        <pre className="LegalOfficerAdditionalDetails">{ props.additionalDetails }</pre>
    );
}
