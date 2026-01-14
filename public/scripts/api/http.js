export async function http(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include", 
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
        const message =
            (isJson && body?.error) ||
            body ||
            res.statusText ||
            "Something went wrong";

        throw new Error(message);
    }

    return body;
}
