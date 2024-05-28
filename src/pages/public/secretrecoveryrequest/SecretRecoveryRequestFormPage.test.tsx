import { LocRequestStatus, LogionClient, PublicLoc } from '@logion/client';
import { UUID, LocType } from "@logion/node-api";
import { screen, render, waitFor } from '@testing-library/react';
import SecretRecoveryRequestFormPage from './SecretRecoveryRequestFormPage';
import { clickByName, typeByLabel } from 'src/tests';
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { fullCertificateUrl, fullSecretDownloadPageUrl } from 'src/PublicPaths';

jest.mock("src/logion-chain");

describe("SecretRecoveryRequestFormPage", () => {

    it("shows success message", async () => {
        setClientMock(mockClient(LOC_ID, {
            locType: "Identity",
            status: "CLOSED",
        }));
        render(<SecretRecoveryRequestFormPage />);
        await fillInSecretRecoveryRequestForm();
        await fillInIdentityForm();

        await clickByName("Submit");

        await waitFor(() => expect(screen.queryByText("Submission successful")).toBeInTheDocument());
        expect(screen.queryByText(LOC_ID.toDecimalString())).toBeInTheDocument();
        expect(screen.queryByText(SECRET_NAME)).toBeInTheDocument();
        expect(screen.queryByRole("link", {name: fullSecretDownloadPageUrl(LOC_ID, CHALLENGE, REQUEST_ID)})).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
    });

    it("prevents submission if missing data", async () => {
        render(<SecretRecoveryRequestFormPage />);
        await clickByName("Submit");
        await waitFor(() => expect(screen.queryByText("Some information above is not valid")).toBeInTheDocument());
    });

    it("prevents submission if LOC not found", async () => {
        setClientMock(mockClient(new UUID(), {
            locType: "Identity",
            status: "CLOSED",
        }));
        render(<SecretRecoveryRequestFormPage />);
        await fillInSecretRecoveryRequestForm();
        await fillInIdentityForm();

        await clickByName("Submit");

        await waitFor(() => expect(screen.queryByText("Some information above is not valid")).toBeInTheDocument());
        expect(screen.queryByText("LOC not found")).toBeInTheDocument();
    });

    it("prevents submission if not identity LOC", async () => {
        setClientMock(mockClient(LOC_ID, {
            locType: "Collection",
            status: "CLOSED",
        }));
        render(<SecretRecoveryRequestFormPage />);
        await fillInSecretRecoveryRequestForm();
        await fillInIdentityForm();

        await clickByName("Submit");

        await waitFor(() => expect(screen.queryByText("Some information above is not valid")).toBeInTheDocument());
        expect(screen.queryByText("LOC is not an Identity LOC")).toBeInTheDocument();
    });

    it("prevents submission if identity LOC not closed", async () => {
        setClientMock(mockClient(LOC_ID, {
            locType: "Identity",
            status: "OPEN",
        }));
        render(<SecretRecoveryRequestFormPage />);
        await fillInSecretRecoveryRequestForm();
        await fillInIdentityForm();

        await clickByName("Submit");

        await waitFor(() => expect(screen.queryByText("Some information above is not valid")).toBeInTheDocument());
        expect(screen.queryByText("LOC is not closed")).toBeInTheDocument();
    });
});

function mockClient(expectedLocId: UUID, data: { locType: LocType, status: LocRequestStatus }) {
    return {
        public: {
            findLocById: (args: { locId: UUID }) => {
                if(args.locId.equalTo(expectedLocId)) {
                    return Promise.resolve({
                        data,
                    } as PublicLoc);
                } else {
                    return Promise.resolve(undefined);
                }
            }
        },
        secretRecovery: {
            createSecretRecoveryRequest: () => {
                return Promise.resolve(REQUEST_ID);
            }
        }
    } as unknown as LogionClient;
}

const LOC_ID = new UUID();
const SECRET_NAME = "Key";
const CHALLENGE = "Some random challenge";
const REQUEST_ID = "aff8be0d-dbbb-4f08-98a8-5e2020b23f56";

async function fillInSecretRecoveryRequestForm() {
    await typeByLabel("Identity LOC ID", LOC_ID.toDecimalString());
    await typeByLabel("Secret name", SECRET_NAME);
    await typeByLabel("Challenge", CHALLENGE);
}

async function fillInIdentityForm() {
    await typeByLabel("First Name", "John");
    await typeByLabel("Last Name", "Doe");
    await typeByLabel("Email", "john@logion.network");
    await typeByLabel("Phone Number", "+1234");

    await typeByLabel("Line1", "?");
    await typeByLabel("Postal Code", "?");
    await typeByLabel("City", "?");
    await typeByLabel("Country", "?");
}
