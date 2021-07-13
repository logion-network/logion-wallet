import PostalAddressType from "./types/PostalAddress";
import IdentityType from "./types/Identity";
import Identity from "./Identity";
import PostalAddress from "./PostalAddress";
import Frame from "./Frame";
import React from "react";
import './AccountInfo.css';
import { ColorTheme } from "./ColorTheme";
import ComparableField from "./ComparableField";

export interface Props {
    label: string
    address: string
    identity: IdentityType
    postalAddress: PostalAddressType
    otherIdentity?: IdentityType
    otherPostalAddress?: PostalAddressType
    colorTheme: ColorTheme
}

export default function AccountInfo(props: Props) {

    return (
        <Frame className="AccountInfo" colors={ props.colorTheme } altColors={ true }>
            <ComparableField
                id="accountAddress"
                label={ props.label }
                data={ props }
                field={ props => props.address }
                colors={ props.colorTheme.dashboard }
            />
            <Identity
                identity={ props.identity }
                otherIdentity={ props.otherIdentity }
                colors={ props.colorTheme.dashboard }
            />
            <PostalAddress
                postalAddress={ props.postalAddress }
                otherPostalAddress={ props.otherPostalAddress }
                colors={ props.colorTheme.dashboard }
            />
        </Frame>
    )
}
