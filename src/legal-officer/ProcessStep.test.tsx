import { shallowRender } from '../tests';

import ProcessStep from './ProcessStep';

test("Rendering inactive step", () => {
    const proceedCallback = jest.fn();
    const tree = shallowRender(
        <ProcessStep
            active={ false }
            title="Title"
            nextSteps={[
                {
                    id: "proceed",
                    buttonText: "Proceed",
                    buttonVariant: "primary",
                    mayProceed: true,
                    callback: proceedCallback
                }
            ]}
        >
            <p>Content</p>
        </ProcessStep>
    );
    expect(tree).toMatchSnapshot();
});

test("Rendering non-closable active step, may proceed", () => {
    const proceedCallback = jest.fn();
    const tree = shallowRender(
        <ProcessStep
            active={ true }
            title="Title"
            nextSteps={[
                {
                    id: "proceed",
                    buttonText: "Proceed",
                    buttonVariant: "primary",
                    mayProceed: true,
                    callback: proceedCallback
                }
            ]}
        >
            <p>Content</p>
        </ProcessStep>
    );
    expect(tree).toMatchSnapshot();
});

test("Rendering non-closable active step, may not proceed", () => {
    const proceedCallback = jest.fn();
    const tree = shallowRender(
        <ProcessStep
            active={ true }
            title="Title"
            nextSteps={[
                {
                    id: "proceed",
                    buttonText: "Proceed",
                    buttonVariant: "primary",
                    mayProceed: false,
                    callback: proceedCallback
                }
            ]}
        >
            <p>Content</p>
        </ProcessStep>
    );
    expect(tree).toMatchSnapshot();
});

test("Trap detection", () => {
    expect(() => shallowRender(
        <ProcessStep
            active={ true }
            title="Title"
            nextSteps={[]}
        >
        </ProcessStep>
    )).toThrowError();
});
