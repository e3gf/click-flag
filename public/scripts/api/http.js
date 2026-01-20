export async function http(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include", 
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const body = await res.json();

    if (!res.ok) {
        const message =
            (body?.error) ||
            body ||
            res.statusText ||
            "Something went wrong";

        throw new Error(message);
    }

    return body;
}
