import { render, screen, waitFor } from "@testing-library/react";
import SecretDownloadPage from "./SecretDownloadPage";
import { setParams } from "src/__mocks__/ReactRouterMock";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LogionClient } from "@logion/client";
import { UUID } from "@logion/node-api";
import { clickByName } from "src/tests";

jest.mock("../../../logion-chain");

describe("SecretDownloadPage", () => {

    it("downloads secret", async () => {
        setParams({
            locId: LOC_ID,
            challenge: CHALLENGE,
            requestId: REQUEST_ID,
        });
        setClientMock(buildClient());
        render(<SecretDownloadPage/>);

        await clickByName("Download");

        await waitFor(() => expect(screen.getByText("Download successful")).toBeInTheDocument());
        expect(screen.getByText(SECRET_VALUE)).toBeInTheDocument();
    });

    it("displays error", async () => {
        setParams({
            locId: LOC_ID,
            challenge: WRONG_CHALLENGE,
            requestId: REQUEST_ID,
        });
        setClientMock(buildClient());
        render(<SecretDownloadPage/>);

        await clickByName("Download");

        await waitFor(() => expect(screen.getByText("Cannot download")).toBeInTheDocument());
    });
});

function buildClient() {
    return {
        secretRecovery: {
            downloadSecret: (args: { challenge: string, requesterIdentityLocId: UUID, requestId: string }) => {
                if(args.challenge === CHALLENGE && args.requesterIdentityLocId.toString() === LOC_ID && args.requestId === REQUEST_ID) {
                    return Promise.resolve(SECRET_VALUE);
                } else {
                    return Promise.reject(new Error("Cannot download"));
                }
            }
        }
    } as unknown as LogionClient;
}

const LOC_ID = "8be6d197-16b8-4ebb-92a0-836193d9975a";
const CHALLENGE = "some-challenge";
const REQUEST_ID = "aff8be0d-dbbb-4f08-98a8-5e2020b23f56";
const SECRET_VALUE = "Secret";
const WRONG_CHALLENGE = "wrong-challenge";
