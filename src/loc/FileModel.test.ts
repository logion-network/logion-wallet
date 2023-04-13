import { Token, HashOrContent } from "@logion/client";
import { AxiosInstance } from "axios";
import { DEFAULT_LEGAL_OFFICER, PATRICK } from "src/common/TestData";
import {
    addLoFile,
    getAllDeliveries,
    getCollectionItemFile,
    getJsonLoc,
    getLatestDeliveries,
    getLoFile,
    loFileUrl,
} from "./FileModel";

describe("FileModel", () => {

    it("builds LO file URL", () => {
        const file = "header-logo";
        const token = {
            value: "some-token",
        } as Token;
        const url = loFileUrl(PATRICK, file, token);
        expect(url).toBe(`${ PATRICK.node }/api/lo-file/${ PATRICK.address }/${ file }?jwt_token=${ token.value }`);
    })

    it("downloads LO file", async () => {
        const axios = {
            get: jest.fn().mockResolvedValue({
                headers: {
                    "content-type": "image/jpeg",
                }
            }),
        } as unknown as AxiosInstance;

        const legalOfficer = DEFAULT_LEGAL_OFFICER.address;
        const fileId = "header-logo";
        const typedFile = await getLoFile({
            axios,
            legalOfficer,
            fileId,
        });

        expect(axios.get).toBeCalledWith(
            `/api/lo-file/${legalOfficer}/${fileId}`,
            expect.objectContaining({
                responseType: "blob"
            })
        );
    })

    it("downloads collection item file", async () => {
        const axios = {
            get: jest.fn().mockResolvedValue({
                headers: {
                    "content-type": "image/jpeg",
                }
            }),
        } as unknown as AxiosInstance;

        const locId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        const collectionItemId = "0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2";
        const hash = "0x7d79c63f350826b018d2981259eddcdb224d9a974199750d5f5f833635c65d6c";
        const typedFile = await getCollectionItemFile(axios, {
            locId,
            collectionItemId,
            hash,
        });

        expect(axios.get).toBeCalledWith(
            `/api/collection/${ locId }/${ collectionItemId }/files/${ hash }`,
            expect.objectContaining({
                responseType: "blob"
            })
        );
    })

    it("downloads LOC as JSON", async () => {
        const axios = {
            get: jest.fn().mockResolvedValue({
                headers: {
                    "content-type": "application/json",
                }
            }),
        } as unknown as AxiosInstance;

        const locId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        const typedFile = await getJsonLoc(axios, {
            locId,
        });

        expect(axios.get).toBeCalledWith(
            `/api/loc-request/${ locId }`,
            expect.objectContaining({
                responseType: "blob"
            })
        );
    })

    it("adds LO file", async () => {
        const axios = {
            put: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const legalOfficer = DEFAULT_LEGAL_OFFICER.address;
        const fileId = "header-logo";
        const file = new File(["test"], "some-logo.jpeg");
        await addLoFile({
            axios,
            legalOfficer,
            fileId,
            file: HashOrContent.fromContent(file),
        });

        expect(axios.put).toBeCalledWith(
            `/api/lo-file/${ legalOfficer }/${ fileId }`,
            expect.any(FormData),
            expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } }),
        );
    })

    it("gets latest deliveries", async () => {
        const expectedData = {};
        const axios = {
            get: jest.fn().mockResolvedValue({
                data: expectedData
            }),
        } as unknown as AxiosInstance;

        const locId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        const collectionItemId = "0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2";
        const deliveries = await getLatestDeliveries(axios, {
            locId,
            collectionItemId,
        });

        expect(axios.get).toBeCalledWith(`/api/collection/${ locId }/${ collectionItemId }/latest-deliveries`);
        expect(deliveries).toBe(expectedData);
    })

    it("gets all deliveries", async () => {
        const expectedData = {};
        const axios = {
            get: jest.fn().mockResolvedValue({
                data: expectedData
            }),
        } as unknown as AxiosInstance;

        const locId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        const collectionItemId = "0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2";
        const deliveries = await getAllDeliveries(axios, {
            locId,
            collectionItemId,
        });

        expect(axios.get).toBeCalledWith(`/api/collection/${ locId }/${ collectionItemId }/all-deliveries`);
        expect(deliveries).toBe(expectedData);
    })
})
