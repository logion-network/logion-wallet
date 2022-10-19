import { PostalAddress, UserIdentity } from "@logion/client";
import Button from "react-bootstrap/Button";
import Collapsible from "react-collapsible";

export interface Props {
    address: string,
    userIdentity: UserIdentity,
    postalAddress: PostalAddress
}

export default function UserInfo(props: Props) {
    const button = <Button>More</Button>;
    return (
            <>
                {props.userIdentity.firstName} {props.userIdentity.lastName}
                <Collapsible trigger={button}>
                        <p>Polkadot address: {props.address}</p>
                        <p>Email: {props.userIdentity.email}</p>
                        <p>Phone Number: {props.userIdentity.phoneNumber}</p>
                        <p>
                            {props.postalAddress.line1} <br/>
                            {props.postalAddress.line2.length > 0 && <>{props.postalAddress.line2}<br/></>}
                            {props.postalAddress.postalCode} {props.postalAddress.city} <br/>
                            {props.postalAddress.country}
                        </p>
                </Collapsible>
            </>
    )
}
