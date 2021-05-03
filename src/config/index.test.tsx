const OLD_ENV = process.env;

beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
});

afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
});

test("Config reads socket and keyring from env", () => {
    process.env.REACT_APP_PROVIDER_SOCKET = "my-socket";
    process.env.REACT_APP_DEVELOPMENT_KEYRING = "true";
    const config = require('./index.tsx').default;
    expect(config.PROVIDER_SOCKET).toBe("my-socket");
    expect(config.DEVELOPMENT_KEYRING).toBe("true");
});
