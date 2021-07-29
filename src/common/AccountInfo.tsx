import PostalAddressType from "./types/PostalAddress";
import IdentityType from "./types/Identity";
import Identity from "./Identity";
import PostalAddress from "./PostalAddress";
import Frame from "./Frame";
import React from "react";
import './AccountInfo.css';
import { useCommonContext } from "./CommonContext";
import ComparableField from "./ComparableField";

export interface Props {
    label: string
    address: string
    identity: IdentityType
    postalAddress: PostalAddressType
    otherIdentity?: IdentityType
    otherPostalAddress?: PostalAddressType
}

export default function AccountInfo(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <Frame className="AccountInfo" altColors={ true }>
            <ComparableField
                id="accountAddress"
                label={ props.label }
                data={ props }
                field={ props => props.address }
                colors={ colorTheme.dashboard }
            />
            <Identity
                identity={ props.identity }
                otherIdentity={ props.otherIdentity }
                colors={ colorTheme.dashboard }
            />
            <PostalAddress
                postalAddress={ props.postalAddress }
                otherPostalAddress={ props.otherPostalAddress }
                colors={ colorTheme.dashboard }
            />
        </Frame>
    )
}
