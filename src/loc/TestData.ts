import { LegalOfficerCase, UUID } from "@logion/node-api";
import { LocData, HashString } from "@logion/client";
import { DateTime } from "luxon";

export function buildLocRequest(locId: UUID, loc: LegalOfficerCase): LocData {
    return {
        ownerAddress: loc.owner,
        requesterAddress: loc.requesterAddress,
        requesterLocId: loc.requesterLocId,
        description: "Description",
        locType: loc.locType,
        createdOn: DateTime.fromISO("2023-10-10T10:25:18.546+02:00"),
        decisionOn: DateTime.fromISO("2023-10-10T10:25:18.546+02:00"),
        id: locId,
        status: loc.closed ? "CLOSED" : "OPEN",
        files: loc.files.map((locFile, index) => ({
            ...locFile,
            nature: HashString.fromValue(`File ${index}`),
            name: `File ${index}`,
            addedOn: DateTime.fromISO("2023-10-10T10:25:18.546+02:00"),
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
            addedOn: DateTime.fromISO("2023-10-10T10:25:18.546+02:00"),
            published: false,
            status: "DRAFT",
        })),
        links: loc.links.map((locFile, index) => ({
            ...locFile,
            name: `Link ${index}`,
            nature: HashString.fromValue(`Nature ${index}`),
            addedOn: DateTime.fromISO("2023-10-10T10:25:18.546+02:00"),
            target: locFile.id,
            published: false,
            status: "DRAFT",
        })),
        verifiedIssuer: false,
        issuers: [],
    };
}
