import { EditableRequest, LogionClient } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { addLink } from "./client";

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
        } as EditableRequest;

        const nature = "Some link";
        const target = new UUID("8f12876b-7fde-49b0-93a4-d29ed5179151");
        await addLink({
            client,
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
});
