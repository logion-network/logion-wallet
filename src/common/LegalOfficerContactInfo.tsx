import { UserIdentity } from "@logion/client";

export interface Props {
    identity: UserIdentity;
    showName: boolean;
}

export function LegalOfficerContactInfo(props: Props) {

    return (
        <div className="LegalOfficerContactInfo">
            { props.showName && <span>{ props.identity.lastName } { props.identity.firstName }<br /></span> }
            <span>{ props.identity.email }<br /></span>
            <span>{ props.identity.phoneNumber }</span>
        </div>
    );
}
