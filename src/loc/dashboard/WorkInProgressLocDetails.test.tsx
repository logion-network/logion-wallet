import { shallowRender } from "src/tests";
import WorkInProgressLocDetails from "./WorkInProgressLocDetails";
import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";

describe("WorkInProgressLocDetails", () => {

    it("shows reason when LOC rejected", () => {
        const loc = {
            id: new UUID("d6db2a4d-de95-444b-ae96-444e5b49e950"),
            status: "REVIEW_REJECTED",
            rejectReason: "Because.",
        } as unknown as LocData;
        const element = shallowRender(<WorkInProgressLocDetails locData={ loc } />);
        expect(element).toMatchSnapshot();
    });
});
