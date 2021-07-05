import { shallowRender } from '../tests';
import Table from './Table';

interface Record {
    id: string,
    value: string,
}

test("renders", () => {
    const columns = [
        {
            header: "Column 1",
            render: (value: Record) => value.id
        },
        {
            header: "Column 2",
            render: (value: Record) => value.value
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
    />);
    expect(result).toMatchSnapshot();
});
