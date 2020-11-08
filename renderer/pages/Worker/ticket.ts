import Go from './Go';

async function generateTicket(bytes: BufferSource, cookies: string): Promise<string> {
    const go = new Go(cookies);
    const wasm = await WebAssembly.instantiate(bytes, go.importObject);
    await go.run(wasm.instance);
    return go.cookieString;
}

export default generateTicket;