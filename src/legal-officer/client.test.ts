import { EditableRequest, LogionClient, OpenLoc, VerifiedThirdParty, ClosedLoc, Signer, SuccessfulSubmission, VerifiedIssuerIdentity } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { ApiPromise } from "src/__mocks__/PolkadotApiMock";
import { addLink, getVerifiedThirdPartySelections, requestVote, VerifiedThirdPartyWithSelect } from "./client";
import { mockValidPolkadotAccountId } from "src/__mocks__/@logion/node-api/Mocks";

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
            getCurrentState: () => locState,
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
            get: jest.fn().mockResolvedValue({
                data: {
                    issuers: [
                        toVerifiedIssuerIdentity(FORMERLY_SELECTED),
                        toVerifiedIssuerIdentity(REQUESTER),
                        toVerifiedIssuerIdentity(SELECTED),
                        toVerifiedIssuerIdentity(NOT_SELECTED),
                    ]
                }
            }),
        } as unknown as AxiosInstance;

        const client = {
            buildAxios: () => axios,
            legalOfficers: [],
        } as unknown as LogionClient;

        const locId = new UUID("0e16421a-2550-4be5-a6a8-1ab2239b7dc4");
        const locState = {
            data: () => ({
                id: locId,
                requesterAddress: mockValidPolkadotAccountId(REQUESTER.address),
                issuers: [
                    {
                        firstName: SELECTED.firstName,
                        lastName: SELECTED.lastName,
                        identityLocId: SELECTED.identityLocId,
                        address: SELECTED.address,
                    }
                ],
            }),
            locsState: () => ({
                client,
            }),
            getCurrentState: () => locState,
        } as unknown as OpenLoc;

        const verifiedThirdParties: VerifiedThirdPartyWithSelect[] = await getVerifiedThirdPartySelections({ locState });

        expect(axios.get).toBeCalledWith("/api/issuers-identity");

        expect(verifiedThirdParties.length).toEqual(3);
        expect(verifiedThirdParties[0]).toEqual({ ...NOT_SELECTED, selected: false });
        expect(verifiedThirdParties[1]).toEqual({ ...SELECTED, selected: true });
        expect(verifiedThirdParties[2]).toEqual({ ...FORMERLY_SELECTED, selected: false });
    });

    it("requests a vote", async () => {
        const submittable = {};
        const nodeApi = {
            tx: {
                vote: {
                    createVoteForAllLegalOfficers: jest.fn().mockResolvedValue(submittable),
                }
            }
        } as unknown as ApiPromise;

        const client = {
            nodeApi,
            legalOfficers: [],
            buildAxios: () => {},
        } as unknown as LogionClient;

        const locId = new UUID("0e16421a-2550-4be5-a6a8-1ab2239b7dc4");
        const locState = {
            data: () => ({
                id: locId,
                ownerAddress: DEFAULT_LEGAL_OFFICER,
            }),
            locsState: () => ({
                client,
            }),
            getCurrentState: () => locState,
        } as unknown as ClosedLoc;

        const result = {
            events: [
                {
                    name: "VoteCreated",
                    section: "vote",
                    data: [
                        "42",
                        [ DEFAULT_LEGAL_OFFICER ],
                    ],
                }
            ],
        } as unknown as SuccessfulSubmission;
        const signer = {
            signAndSend: jest.fn().mockResolvedValue(result),
        } as Signer;
        const callback = jest.fn();

        await requestVote({
            locState,
            signer,
            callback,
        });

        expect(nodeApi.tx.vote.createVoteForAllLegalOfficers).toBeCalledWith(locId.toDecimalString());
        expect(signer.signAndSend).toBeCalledWith(expect.objectContaining({
            signerId: DEFAULT_LEGAL_OFFICER,
        }));
    });
});

function toVerifiedIssuerIdentity(vtp: VerifiedThirdParty): VerifiedIssuerIdentity {
    return {
        address: vtp.address,
        identityLocId: vtp.identityLocId,
        identity: {
            firstName: vtp.firstName,
            lastName: vtp.lastName,
            email: "",
            phoneNumber: "",
        }
    };
}
