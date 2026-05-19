import { io } from "socket.io-client";

const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

const resolveSocketUrl = () => {
    const explicitSocketUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL);
    if (explicitSocketUrl) {
        return explicitSocketUrl;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
        try {
            return trimTrailingSlash(new URL(apiUrl).origin);
        } catch (_) {
            // Ignore and fall back.
        }
    }

    if (process.env.NODE_ENV !== "production") {
        return "http://localhost:8000";
    }

    return null;
};

const SOCKET_URL = resolveSocketUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

let socket = null;

export const initializeSocket = (token) => {
    if (!SOCKET_URL) {
        console.warn("Socket disabled: set NEXT_PUBLIC_SOCKET_URL to your backend origin.");
        return null;
    }

    if (!socket) {
        socket = io(SOCKET_URL, {
            path: SOCKET_PATH,
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("Socket connected");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
