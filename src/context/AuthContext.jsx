import {createContext,useContext,useState} from "react"; import {authApi} from "../api/services";
const C=createContext(); export const useAuth=()=>useContext(C);
export function AuthProvider({children}){const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("securevault_user")||"null"));
const login=async(username,password)=>{const {data}=await authApi.login(username,password);localStorage.setItem("securevault_token",data.token);localStorage.setItem("securevault_user",JSON.stringify(data));setUser(data);return data};
const logout=()=>{localStorage.removeItem("securevault_token");localStorage.removeItem("securevault_user");setUser(null)};
return <C.Provider value={{user,login,logout}}>{children}</C.Provider>}