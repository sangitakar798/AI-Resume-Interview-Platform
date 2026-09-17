import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");

    const { user, setUser, loading } = context;

    const handleLogin = async ({ email, password }) => {
        const data = await login({ email: email.trim().toLowerCase(), password });
        setUser(data.user);
        return data.user;
    };

    const handleRegister = async ({ username, email, password }) => {
        const data = await register({ username: username.trim(), email: email.trim().toLowerCase(), password });
        setUser(data.user);
        return data.user;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            // Sign out locally even if the saved server session has already expired.
            setUser(null);
        }
    };

    return { user, loading, handleLogin, handleRegister, handleLogout };
};
