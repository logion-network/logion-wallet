import { PostalAddress } from "@logion/client";

export interface Props {
    address: PostalAddress;
}

export function LegalOfficerPostalAddress(props: Props) {

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
