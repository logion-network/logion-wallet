import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';

import { Col } from '../common/Grid';
import Detail from "../common/Detail";

import CopyPasteButton from "../common/CopyPasteButton";
import { LegalOfficerPostalAddressInfo } from "../common/LegalOfficerPostalAddressInfo";
import { useLogionChain } from '../logion-chain';

export interface Props {
    request : ProtectionRequest,
}

export default function ProtectedUserDetails(props: Props) {
    const { getOfficer } = useLogionChain();

    if(getOfficer === undefined) {
        return null;
    }

    const legalOfficer = getOfficer(props.request.otherLegalOfficerAddress);

    let userAddress;
    if(props.request.userPostalAddress.line2 === null || props.request.userPostalAddress.line2 === "") {
        userAddress = <span>{ props.request.userPostalAddress.line1 }</span>
    } else {
        userAddress = <span>{ props.request.userPostalAddress.line1 }<br/>{ props.request.userPostalAddress.line2 }</span>
    }

    const polkadotAddress = (address: string) => <Detail
        label="Polkadot Address"
        value={ <>
            { address }
            <CopyPasteButton value={ address } className="medium" />
        </> }
    />;

    return (
        <>
            <Col
                style={ { width: "30%" } }
            >
                { polkadotAddress(props.request.requesterAddress) }
                <Detail
                    label="Email"
                    value={ props.request.userIdentity.email }
                />
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity.phoneNumber }
                />
            </Col>
            <Col
                style={ { width: "25%" } }
            >
                <Detail
                    label="Postal Address"
                    value={ userAddress }
                />
                <Detail
                    label="City"
                    value={ props.request.userPostalAddress.postalCode + " " + props.request.userPostalAddress.city }
                />
                <Detail
                    label="Country"
                    value={ props.request.userPostalAddress.country }
                />
            </Col>
            <Col
                style={ { width: "45%" } }
            >
                { polkadotAddress(props.request.otherLegalOfficerAddress) }
                <Detail
                    label="Details"
                    value={ <LegalOfficerPostalAddressInfo address={ legalOfficer!.postalAddress } /> }
                />
            </Col>
            <Col style={ { width: "200px" } }>&nbsp;</Col>
        </>
    );
}
