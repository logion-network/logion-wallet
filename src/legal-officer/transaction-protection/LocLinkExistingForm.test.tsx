import { shallowRender } from "../../tests";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { Mock } from "moq.ts";
import { Control, FieldErrors } from "react-hook-form";

describe("LocLinkExistingForm", () => {

    it("renders", () => {
        const control = new Mock<Control<FormValues>>()
        const errors = new Mock<FieldErrors<FormValues>>()
        const tree = shallowRender(<LocLinkExistingForm
            control={ control.object() }
            errors={ errors.object() }
        />)
        expect(tree).toMatchSnapshot()
    })
})
