function mockResponse(data: any) {
    return {
        data
    };
}

let axiosInstance: any = {};

const axios = {

    get: (url: string) => mockResponse({}),
    put: (url: string) => mockResponse({}),
    post: (url: string) => mockResponse({}),
    create: () => axiosInstance,
};
export default axios;

export function mockPut(whenUrl: string, thenData: any, thenCall?: () => void) {
    axiosInstance.put = (url: string): any => {
        if(url === whenUrl) {
            if(thenCall !== undefined) {
                thenCall();
            }
            return mockResponse(thenData);
        }
    };
}

export function mockPost(whenUrl: string, thenData: any, thenCall?: () => void) {
    axiosInstance.post = (url: string): any => {
        if(url === whenUrl) {
            if(thenCall !== undefined) {
                thenCall();
            }
            return mockResponse(thenData);
        }
    };
}
