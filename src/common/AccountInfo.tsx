import { UserIdentity as IdentityType, PostalAddress as PostalAddressType } from "@logion/client";

import Identity from "./Identity";
import PostalAddress from "./PostalAddress";
import './AccountInfo.css';
import { BackgroundAndForegroundColors } from "./ColorTheme";

export interface Props {
    label: string
    identity?: IdentityType
    postalAddress?: PostalAddressType
    otherIdentity?: IdentityType
    otherPostalAddress?: PostalAddressType
    colors: BackgroundAndForegroundColors
    squeeze: boolean
    noComparison: boolean
}

export default function AccountInfo(props: Props) {
    return (
        <div className="AccountInfo">
            <Identity
                identity={ props.identity }
                otherIdentity={ props.otherIdentity }
                colors={ props.colors }
                squeeze={ props.squeeze }
                noComparison={ props.noComparison }
            />
            <PostalAddress
                postalAddress={ props.postalAddress }
                otherPostalAddress={ props.otherPostalAddress }
                colors={ props.colors }
                squeeze={ props.squeeze }
                noComparison={ props.noComparison }
            />
        </div>
    )
}
