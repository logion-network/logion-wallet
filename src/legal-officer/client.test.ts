import { EditableRequest, LogionClient, OpenLoc, VerifiedThirdParty } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { addLink, getVerifiedThirdPartySelections } from "./client";

describe("Legal Officer client", () => {

    it("adds link to LOC", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const client = {
            buildAxios: () => axios,
            legalOfficers: [],
        } as unknown as LogionClient;

        const locId = new UUID("0e16421a-2550-4be5-a6a8-1ab2239b7dc4");
        const locState = {
            data: () => ({
                id: locId,
            }),
            refresh: () => Promise.resolve(locState),
            locsState: () => ({
                client,
            }),
        } as unknown as EditableRequest;

        const nature = "Some link";
        const target = new UUID("8f12876b-7fde-49b0-93a4-d29ed5179151");
        await addLink({
            locState,
            target,
            nature,
        });

        expect(axios.post).toBeCalledWith(
            `/api/loc-request/${locId.toString()}/links`,
            expect.objectContaining({
                nature,
                target: target.toString(),
            })
        )
    })

    it("gets vtp selections ordered by last name", async () => {

        function verifiedThirdParty(index: number): VerifiedThirdParty {
            return {
                address: "addr" + index,
                identityLocId: "id" + index,
                firstName: "Scott" + index,
                lastName: "Tiger" + index,
            }
        }

        const REQUESTER = verifiedThirdParty(1);
        const NOT_SELECTED = verifiedThirdParty(2);
        const SELECTED = verifiedThirdParty(3);
        const FORMERLY_SELECTED = verifiedThirdParty(4);

        const axios = {
            get: jest.fn().mockResolvedValue({ data: { verifiedThirdParties: [ FORMERLY_SELECTED, REQUESTER, SELECTED, NOT_SELECTED ] } }),
        } as unknown as AxiosInstance;

        const client = {
            buildAxios: () => axios,
            legalOfficers: [],
        } as unknown as LogionClient;

        const locId = new UUID("0e16421a-2550-4be5-a6a8-1ab2239b7dc4");
        const locState = {
            data: () => ({
                id: locId,
                requesterAddress: REQUESTER.address,
                selectedParties: [
                    { ...SELECTED, selected: true },
                    { ...FORMERLY_SELECTED, selected: false }
                ],
            }),
            locsState: () => ({
                client,
            }),
        } as unknown as OpenLoc;

        const verifiedThirdParties: VerifiedThirdParty[] = await getVerifiedThirdPartySelections({ locState });

        expect(axios.get).toBeCalledWith("/api/verified-third-parties");

        expect(verifiedThirdParties.length).toEqual(3);
        expect(verifiedThirdParties[0]).toEqual({ ...NOT_SELECTED, selected: false });
        expect(verifiedThirdParties[1]).toEqual({ ...SELECTED, selected: true });
        expect(verifiedThirdParties[2]).toEqual({ ...FORMERLY_SELECTED, selected: false });
    })
});
