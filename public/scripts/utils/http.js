async function http(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || res.statusText);
    }

    return res;
}