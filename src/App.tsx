
import { AppThemeProvider } from "../theme/ThemeContext"
import {Routes, Route, Navigate} from "react-router-dom";
import Context from "./pages/context/Context.tsx";
import {useEffect, useState} from "react";
import {startTokenRefreshInterval} from "./axios/axiosInstance.ts";
import Login from "./pages/login/Login.tsx";
import  Home  from "./pages/context/screens/Home.tsx";
import Appointment from "./pages/context/screens/Appointment.tsx";
import Patients from "./pages/context/screens/Patients.tsx";



const isValidToke:(token: string) => "" | false | boolean = (token: string) => {
    return token && token !== 'undefined' && token.trim() !== ''
}


function App() {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isValidToke(localStorage.getItem('access_token')));


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setIsAuthenticated(isValidToke(localStorage.getItem('access_token')));
    }, [isAuthenticated]);

    const handleLogin = ()=>{
        setIsAuthenticated(true)
    }

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) startTokenRefreshInterval();
    }, []);
    return (
        <AppThemeProvider>
            <Routes>
                <Route >
                    <Route path="/" element={ isAuthenticated ? <Navigate to="/context" /> : <Navigate to="/login" />} />
                    <Route path="/login"  element={isAuthenticated ? <Navigate to="/context" /> : <Login onLogin={handleLogin} /> }/>
                    <Route path="/context" element={isAuthenticated ? <Context /> : <Navigate to="/login"/> } >
                        <Route path="/context" element={<Navigate to="/context/home" />} />
                        <Route path="/context/home" element={<Home />} />
                        {/*<Route path="/context/doctors" element={<Doctor />} />*/}
                        <Route path="/context/appointments" element={<Appointment />} />
                        <Route path="/context/patients" element={<Patients />} />
                    </Route>
                </Route>
            </Routes>
        </AppThemeProvider>
    )
}

export default App
