import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()


export const AuthProvider = ({children}) =>{
const [user ,setUser] = useState(null)
const [loading ,setLoading] = useState(true)

useEffect(() => {
    let active = true;
    const restoreSession = async () => {
        try {
            const data = await getMe();
            if (active) setUser(data.user);
        } catch {
            if (active) setUser(null);
        } finally {
            if (active) setLoading(false);
        }
    };
    restoreSession();
    return () => { active = false; };
}, []);


return(
<AuthContext.Provider value={{user,setUser,loading,setLoading}}>
{children}
</AuthContext.Provider>
)


}
