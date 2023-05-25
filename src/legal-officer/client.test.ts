import { EditableRequest, LogionClient, OpenLoc, VerifiedIssuer, ClosedLoc, Signer, SuccessfulSubmission, VerifiedIssuerIdentity } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { addLink, getVerifiedIssuerSelections, requestVote, VerifiedIssuerWithSelect } from "./client";
import { api, mockValidPolkadotAccountId, setupApiMock } from "src/__mocks__/LogionMock";
import { It, Mock } from "moq.ts";
import { Compact, u128 } from "@polkadot/types-codec";

describe("Legal Officer client", () => {

    it("adds link to LOC", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const client = {
            getLegalOfficer: () => ({ buildAxiosToNode: () => axios })
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

    it("gets issuer selections ordered by last name", async () => {

        function verifiedIssuer(index: number): VerifiedIssuer {
            return {
                address: "addr" + index,
                identityLocId: "id" + index,
                firstName: "Scott" + index,
                lastName: "Tiger" + index,
            }
        }

        const REQUESTER = verifiedIssuer(1);
        const NOT_SELECTED = verifiedIssuer(2);
        const SELECTED = verifiedIssuer(3);
        const FORMERLY_SELECTED = verifiedIssuer(4);

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
            getLegalOfficer: () => ({ buildAxiosToNode: () => axios })
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

        const verifiedIssuers: VerifiedIssuerWithSelect[] = await getVerifiedIssuerSelections({ locState });

        expect(axios.get).toBeCalledWith("/api/issuers-identity");

        expect(verifiedIssuers.length).toEqual(3);
        expect(verifiedIssuers[0]).toEqual({ ...NOT_SELECTED, selected: false });
        expect(verifiedIssuers[1]).toEqual({ ...SELECTED, selected: true });
        expect(verifiedIssuers[2]).toEqual({ ...FORMERLY_SELECTED, selected: false });
    });

    it("requests a vote", async () => {
        setupApiMock(api => {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>;
            api.setup(instance => instance.polkadot.tx.vote.createVoteForAllLegalOfficers(It.IsAny())).returns(submittable.object());
            const locId = new Mock<Compact<u128>>();
            api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        });
        const client = {
            logionApi: api.object(),
            getLegalOfficer: () => ({ buildAxiosToNode: () => {} }),
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

        api.verify(instance => instance.polkadot.tx.vote.createVoteForAllLegalOfficers(It.IsAny()));
        expect(signer.signAndSend).toBeCalledWith(expect.objectContaining({
            signerId: DEFAULT_LEGAL_OFFICER,
        }));
    });
});

function toVerifiedIssuerIdentity(issuer: VerifiedIssuer): VerifiedIssuerIdentity {
    return {
        address: issuer.address,
        identityLocId: issuer.identityLocId,
        identity: {
            firstName: issuer.firstName,
            lastName: issuer.lastName,
            email: "",
            phoneNumber: "",
        }
    };
}
