import { shallowRender } from '../tests';
import WarningDialog from './WarningDialog';

test("renders", () => {
    const result = shallowRender(<WarningDialog
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
    </WarningDialog>);
    expect(result).toMatchSnapshot();
});
