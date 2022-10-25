import { CreativeCommonsCode } from "@logion/client";

import by from "@creativecommons/cc-assets/license_badges/big/by.svg";
import by_sa from "@creativecommons/cc-assets/license_badges/big/by_sa.svg";
import by_nd from "@creativecommons/cc-assets/license_badges/big/by_nd.svg";
import by_nc from "@creativecommons/cc-assets/license_badges/big/by_nc.eu.svg";
import by_nc_sa from "@creativecommons/cc-assets/license_badges/big/by_nc_sa.eu.svg";
import by_nc_nd from "@creativecommons/cc-assets/license_badges/big/by_nc_nd.eu.svg";

export const creativeCommonsBadges: Record<CreativeCommonsCode, string> = {
    "BY": by,
    "BY-SA": by_sa,
    "BY-ND": by_nd,
    "BY-NC": by_nc,
    "BY-NC-SA": by_nc_sa,
    "BY-NC-ND": by_nc_nd,
}

interface CreativeCommonsIconProps {
    code: CreativeCommonsCode
}

export default function CreativeCommonsIcon(props: CreativeCommonsIconProps) {
    const { code } = props;
    return (
        <img className="CreativeCommonsIcon" src={ creativeCommonsBadges[code] } alt={ code } />
    )
}
