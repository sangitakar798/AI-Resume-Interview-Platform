// import { useNavigate } from "react-router";
// import { useAuth } from "../hooks/useAuth";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import Protected from "../features/auth/components/Protected.jsx"
// import { Navigate } from "react-router";
// const Protected = ({children}) =>{
// const {loading,user} = useAuth()
// const navigate = useNavigate()

// if(loading){
//     return (<main><h1>Loading......</h1></main>)
// }
// if(!user){
//     return <Navigate to={'/login'} />
// }

// return children
// }
// export default Protected
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";
import AppNavigation from "../../../components/AppNavigation";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) return <LoadingScreen label="Restoring your session..." />;

  return user ? <><AppNavigation />{children}</> : <Navigate to="/login" replace />;
  
};

export default Protected;
