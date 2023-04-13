import { UserIdentity, PostalAddress } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";

export interface PersonalInfoProps {
    requesterAddress?: ValidAccountId | null,
    userIdentity?: UserIdentity,
    userPostalAddress?: PostalAddress,
    company?: string,
}
