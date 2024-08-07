import { UUID } from "@logion/node-api";
import { DraftRequest, LocsState } from "@logion/client";
import { twoLegalOfficers } from "../common/TestData";
import { setLocsState, setMutateLocsState } from "../wallet-user/__mocks__/UserContextMock";
import { render, waitFor, screen, getByText } from "@testing-library/react";
import { clickByName, typeByLabel } from "../tests";
import { navigate } from "../__mocks__/ReactRouterMock";
import DataLocRequest from "./DataLocRequest";
import userEvent from "@testing-library/user-event";
import { LegalOfficerClass } from "@logion/client/dist/Types";

jest.mock('../wallet-user/UserContext');
jest.mock('../logion-chain');
jest.mock('../common/CommonContext');

const locId = new UUID("a2b9dfa7-cbde-414b-8cda-cdd221a57643");

describe("DataLocRequest", () => {

    it("should disable form submission when no valid identity locs", async  () => {

        setupLocsState([]);
        render(<DataLocRequest locType="Collection" iconId="collection" backPath="back" />);
        await checkFormDisabled();
    });

    it("should disable form submission when no legal officer selected", async  () => {

        setupLocsState(twoLegalOfficers);
        render(<DataLocRequest locType="Collection" iconId="collection" backPath="back" />);
        await checkFormDisabled();
    });
})

describe("DataLocRequest (Transaction)", () => {

    it("should redirect when form is correctly filled in and submitted", async  () => {

        setupLocsState(twoLegalOfficers);
        render(<DataLocRequest locType="Transaction" iconId="loc" backPath="back" />);

        await selectLegalOfficer();
        await fillInForm("Transaction");
        expect(screen.getByRole("button", { name: "Create Draft" })).toBeEnabled();
        await clickByName("Create Draft");

        await waitFor(() => expect(navigate).toBeCalledWith(`/user/loc/transaction/${locId.toString()}`));
    });
})

describe("DataLocRequest (Collection)", () => {

    it("should redirect when form is correctly filled in and submitted", async () => {

        setupLocsState(twoLegalOfficers);
        render(<DataLocRequest locType="Collection" iconId="collection" backPath="back" />);

        await selectLegalOfficer();
        await fillInForm("Collection");
        expect(screen.getByRole("button", { name: "Create Draft" })).toBeEnabled();
        await clickByName("Create Draft");

        await waitFor(() => expect(navigate).toBeCalledWith(`/user/loc/collection/${ locId.toString() }`));
    });

    it("should disable form submission when no collection limit selected", async  () => {

        setupLocsState(twoLegalOfficers);
        render(<DataLocRequest locType="Collection" iconId="collection" backPath="back" />);
        await selectLegalOfficer();
        await checkFormDisabled();
    });
})

async function checkFormDisabled() {
    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Create Draft" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Request an Identity Protection" })).toBeEnabled();
    });
}

function setupLocsState(legalOfficersWithNonVoidIdentityLoc: LegalOfficerClass[]) {
    const draftRequest = {
        locId,
        locsState: () => locsState,
        data: () => ({
            id: locId,
        }),
    } as DraftRequest;
    const locsState = {
        legalOfficersWithNonVoidIdentityLoc,
        requestTransactionLoc: () => Promise.resolve(draftRequest),
        requestCollectionLoc: () => Promise.resolve(draftRequest),
    } as unknown as LocsState;
    setLocsState(locsState);
    setMutateLocsState(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
        await mutator(locsState);
        return Promise.resolve();
    });
}

async function selectLegalOfficer() {
    const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
    await userEvent.click(getByText(legalOfficer1Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen (workload: 1)")));
}

async function fillInForm(locType: 'Transaction' | 'Collection') {
    await typeByLabel("Description", "description");
    if (locType === 'Collection') {
        await typeByLabel("Value fee", "10");
        await typeByLabel("Collection item fee", "10");
        await typeByLabel("Tokens record fee", "10");
        await selectAndEnterText(1, "Data number limit", "999");
    }
}

async function selectAndEnterText(index: number, name: string, value: string) {
    await selectCheckbox(index);
    await typeByLabel(name, value);
}

async function selectCheckbox(index: number) {
    const checkBoxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkBoxes[index]);
}

