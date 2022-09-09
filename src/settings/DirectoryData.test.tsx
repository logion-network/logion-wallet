import { act, render, screen, waitFor } from '@testing-library/react';
import { PATRICK } from 'src/common/TestData';
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress, saveOfficer } from '../logion-chain/__mocks__/LogionChainMock';
import { clickByName } from '../tests';
import DirectoryData from './DirectoryData';

jest.mock("../logion-chain");
jest.mock("../common/CommonContext");

describe("DirectoryData", () => {

    it("renders", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        render(<DirectoryData/>);

        await waitFor(() => expect(screen.getByLabelText("First name")).toHaveValue(PATRICK.userIdentity.firstName));
        expect(screen.getByLabelText("Last name")).toHaveValue(PATRICK.userIdentity.lastName);
        expect(screen.getByLabelText("E-mail")).toHaveValue(PATRICK.userIdentity.email);
        expect(screen.getByLabelText("Phone number")).toHaveValue(PATRICK.userIdentity.phoneNumber);

        expect(screen.getByLabelText("Company")).toHaveValue(PATRICK.postalAddress.company);
        expect(screen.getByLabelText("Line 1")).toHaveValue(PATRICK.postalAddress.line1);
        expect(screen.getByLabelText("Line 2")).toHaveValue(PATRICK.postalAddress.line2);
        expect(screen.getByLabelText("Postal code")).toHaveValue(PATRICK.postalAddress.postalCode);
        expect(screen.getByLabelText("City")).toHaveValue(PATRICK.postalAddress.city);
        expect(screen.getByLabelText("Country")).toHaveValue(PATRICK.postalAddress.country);

        expect(screen.getByLabelText("Additional details")).toHaveValue(PATRICK.additionalDetails);
    })

    it("saves successfully", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        
        render(<DirectoryData/>);
        
        await act(() => clickByName("Save changes"));
        await waitFor(() => expect(screen.getByText("Data were saved successfully")).toBeVisible());
    })

    it("shows error on failed save", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        saveOfficer.mockImplementation(() => Promise.reject());
        
        render(<DirectoryData/>);
        
        await act(() => clickByName("Save changes"));
        await waitFor(() => expect(screen.getByText("Data were not saved successfully")).toBeVisible());
    })
})
