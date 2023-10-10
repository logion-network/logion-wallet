import { LegalOfficerCase, UUID, Hash } from "@logion/node-api";
import { LocData, HashString } from "@logion/client";
import { DateTime } from "luxon";

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
            nature: HashString.fromValue(`File ${index}`),
            name: `File ${index}`,
            addedOn: DateTime.now(),
            published: false,
            restrictedDelivery: false,
            contentType: "text/plain",
            size: 42n,
            status: "DRAFT",
        })),
        metadata: loc.metadata.map((locFile, index) => ({
            ...locFile,
            name: HashString.fromValue(`Data ${index}`),
            value: HashString.fromValue(`Value ${index}`),
            addedOn: DateTime.now(),
            published: false,
            status: "DRAFT",
        })),
        links: loc.links.map((locFile, index) => ({
            ...locFile,
            name: `Link ${index}`,
            nature: HashString.fromValue(`Nature ${index}`),
            addedOn: DateTime.now(),
            target: locFile.id,
            published: false,
            status: "DRAFT",
        })),
        closed: false,
        verifiedIssuer: false,
        issuers: [],
    };
}
