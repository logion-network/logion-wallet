import { SpecificLicense as SpecificLicenseType } from "@logion/client";
import NewTabLink from "src/common/NewTabLink";
import { fullCertificateUrl } from "src/PublicPaths";
import CertificateLabel from "./CertificateLabel";

export interface Props {
    specificLicense?: SpecificLicenseType;
}

export default function SpecificLicense(props: Props) {

    return (
        <div className="SpecificLicense">
            <CertificateLabel smaller={ true }>Additional licensing terms / contract</CertificateLabel>
            {
                !props.specificLicense &&
                <p>None</p>
            }
            {
                props.specificLicense !== undefined &&
                <>
                <p>The Requester provided an additional specific contract with regards to the Collection Item Underlying Asset. This contract has been recorded in a LOC with the following ID:</p>
                <NewTabLink
                    iconId="loc-link"
                    href={ fullCertificateUrl(props.specificLicense.tcLocId) }
                >
                    { props.specificLicense.tcLocId.toDecimalString() }
                </NewTabLink>
                </>
            }
        </div>
    );
}
