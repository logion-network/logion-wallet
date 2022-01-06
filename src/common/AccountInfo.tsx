import PostalAddressType from "./types/PostalAddress";
import IdentityType from "./types/Identity";
import Identity from "./Identity";
import PostalAddress from "./PostalAddress";
import './AccountInfo.css';
import ComparableField from "./ComparableField";
import { BackgroundAndForegroundColors } from "./ColorTheme";

export interface Props {
    label: string
    address: string
    identity: IdentityType
    postalAddress: PostalAddressType
    otherIdentity?: IdentityType
    otherPostalAddress?: PostalAddressType
    colors: BackgroundAndForegroundColors
    squeeze: boolean
}

export default function AccountInfo(props: Props) {
    return (
        <div className="AccountInfo">
            <ComparableField
                id="accountAddress"
                label={ props.label }
                data={ props }
                field={ props => props.address }
                colors={ props.colors }
                squeeze={ props.squeeze }
            />
            <Identity
                identity={ props.identity }
                otherIdentity={ props.otherIdentity }
                colors={ props.colors }
                squeeze={ props.squeeze }
            />
            <PostalAddress
                postalAddress={ props.postalAddress }
                otherPostalAddress={ props.otherPostalAddress }
                colors={ props.colors }
                squeeze={ props.squeeze }
            />
        </div>
    )
}
