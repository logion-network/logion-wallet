import { UUID } from "@logion/node-api";
import { shallowRender } from "src/tests";
import { useLocContext } from "./LocContext";
import { UserLocContextProvider, useUserLocContext } from "./UserLocContext";

jest.mock("../wallet-user/UserContext");

describe("UserLocContextProvider", () => {

    it("renders", () => {
        const element = shallowRender(<UserLocContextProvider
            locId={ locId }
            backPath="/"
            detailsPath={ () => "" }
        >
            <p>Some content</p>
        </UserLocContextProvider>);
        expect(element).toMatchSnapshot();
    })

    it("uses LOC context", () => {
        expect(useUserLocContext).toBe(useLocContext);
    })
})

const locId = new UUID("274c1273-5d0e-4c81-bce4-a15518affd35");
