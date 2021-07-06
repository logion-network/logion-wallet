import { shallowRender } from '../tests';

import Table, { Cell } from './Table';
import { COLOR_THEME } from './TestData';

interface Record {
    id: string,
    value: string,
}

test("renders", () => {
    const columns = [
        {
            header: "Column 1",
            render: (value: Record) => <Cell content={ value.id }/>,
            width: 6,
        },
        {
            header: "Column 2",
            render: (value: Record) => <Cell content={ value.id } smallText/>,
            width: 6,
        }
    ];
    const data: Record[] = [
        {
            id: "id1",
            value: "Value 1",
        },
        {
            id: "id2",
            value: "Value 2",
        }
    ];
    const result = shallowRender(<Table
        columns={ columns }
        data={ data }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});
