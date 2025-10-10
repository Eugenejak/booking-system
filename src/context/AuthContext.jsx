import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // On app load, check if token exists
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded); // store user info from token
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("authToken");
            }
        }
    }, []);

    // Provide user and setUser globally
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
