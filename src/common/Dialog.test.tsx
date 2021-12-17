import { shallowRender } from '../tests';
import Dialog from './Dialog';

test("renders", () => {
    const result = shallowRender(<Dialog
        show={ true }
        actions={[
            {
                id: "button",
                buttonText: "Text",
                callback: jest.fn(),
                buttonVariant: 'primary'
            }
        ]}
        size="lg"
    >
        Content
    </Dialog>);
    expect(result).toMatchSnapshot();
});
