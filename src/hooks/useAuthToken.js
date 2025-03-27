import { useState, useCallback } from "react";

const useAuthToken = () => {
    const [authError, setAuthError] = useState(null);

    const getAccessToken = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!token) {
            setAuthError("No access token found.");
            return null;
        }

        const isTokenExpired = (token) => {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload.exp * 1000 < Date.now();
            } catch (e) {
                console.error("Failed to decode token:", e);
                return true;
            }
        };

        if (!isTokenExpired(token)) {
            return token;
        }

        if (refreshToken) {
            try {
                const response = await fetch("/api/proxy/token/refresh/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!response.ok) {
                    throw new Error("Failed to refresh token");
                }

                const data = await response.json();
                localStorage.setItem("accessToken", data.access);
                return data.access;
            } catch (error) {
                console.error("Error refreshing token:", error.message);
                setAuthError("Failed to refresh token. Please log in again.");
                return null;
            }
        } else {
            setAuthError("No refresh token found. Please log in again.");
            return null;
        }
    }, []);

    return { getAccessToken, authError };
};

export default useAuthToken;