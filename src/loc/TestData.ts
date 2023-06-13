import { LegalOfficerCase, UUID } from "@logion/node-api";
import { LocData } from "@logion/client";

export function buildLocRequest(locId: UUID, loc: LegalOfficerCase): LocData {
    return {
        ownerAddress: loc.owner,
        requesterAddress: loc.requesterAddress,
        requesterLocId: loc.requesterLocId,
        description: "Description",
        locType: loc.locType,
        createdOn: "",
        decisionOn: "",
        id: locId,
        status: loc.closed ? "CLOSED" : "OPEN",
        files: loc.files.map((locFile, index) => ({
            ...locFile,
            name: `File ${index}`,
            addedOn: "",
            published: false,
            restrictedDelivery: false,
            contentType: "text/plain",
            size: 42n,
            status: "DRAFT",
        })),
        metadata: loc.metadata.map((locFile, index) => ({
            ...locFile,
            name: `Data ${index}`,
            addedOn: "",
            published: false,
            status: "DRAFT",
        })),
        links: loc.links.map((locFile, index) => ({
            ...locFile,
            name: `Link ${index}`,
            addedOn: "",
            target: locFile.id.toString(),
            published: false,
        })),
        closed: false,
        verifiedIssuer: false,
        issuers: [],
    };
}
