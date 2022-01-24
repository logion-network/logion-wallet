import { LocRequest } from "../common/types/ModelTypes";
import { LegalOfficerCase } from "../logion-chain/Types";
import { UUID } from "../logion-chain/UUID";

export function buildLocRequest(locId: UUID, loc: LegalOfficerCase): LocRequest {
    return {
        ownerAddress: loc.owner,
        requesterAddress: loc.requesterAddress,
        requesterIdentityLoc: loc.requesterLocId?.toString(),
        description: "Description",
        locType: loc.locType,
        createdOn: "",
        decisionOn: "",
        id: locId.toString(),
        status: loc.closed ? "CLOSED" : "OPEN",
        files: loc.files.map((locFile, index) => ({
            ...locFile,
            name: `File ${index}`,
            addedOn: "",
        })),
        metadata: loc.metadata.map((locFile, index) => ({
            ...locFile,
            name: `Data ${index}`,
            addedOn: "",
        })),
        links: loc.links.map((locFile, index) => ({
            ...locFile,
            name: `Link ${index}`,
            addedOn: "",
            target: locFile.id.toString(),
        }))
    };
}
