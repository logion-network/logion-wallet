import { LegalOfficerPostalAddress } from "@logion/client";

export interface Props {
    address: LegalOfficerPostalAddress;
}

export function LegalOfficerPostalAddressInfo(props: Props) {

    return (
        <div className="LegalOfficerPostalAddress">
            { props.address.company && <span>{ props.address.company }<br /></span> }
            <span>{ props.address.line1 }<br /></span>
            <span>{ props.address.line2 }<br /></span>
            <span>{ `${props.address.postalCode} ${props.address.city}` }<br /></span>
            <span>{ props.address.country }</span>
        </div>
    );
}
