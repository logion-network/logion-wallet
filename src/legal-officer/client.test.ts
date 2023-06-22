import { LogionClient, VerifiedIssuer, ClosedLoc, Signer, SuccessfulSubmission, VerifiedIssuerIdentity } from "@logion/client";
import { UUID } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { requestVote } from "./client";
import { api, setupApiMock } from "src/__mocks__/LogionMock";
import { It, Mock } from "moq.ts";
import { Compact, u128 } from "@polkadot/types-codec";

describe("Legal Officer client", () => {

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
