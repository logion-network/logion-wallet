import { UserIdentity, PostalAddress } from "@logion/client";

export interface PersonalInfoProps {
    requesterAddress?: string | null,
    userIdentity?: UserIdentity,
    userPostalAddress?: PostalAddress,
}
