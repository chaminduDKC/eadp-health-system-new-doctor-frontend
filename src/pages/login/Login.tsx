import  {useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiosInstance.ts";
import * as React from "react";

const CookieManagerService = {
    set: (token: string, key: string) => localStorage.setItem(key, token),
    get: (key: string) => localStorage.getItem(key),
    tokenIsExists: (key: string) => !!localStorage.getItem(key),
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const navigateTo = useNavigate();

    const clientId = import.meta.env.VITE_CLIENT_ID;
    const tokenUri = import.meta.env.VITE_KC_API;
    const userUrl = import.meta.env.VITE_USER_API;

    const handleSubmit = async (e:React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);

        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("client_id", clientId);
        params.append("username", username);
        params.append("password", password);

        
        try {
            const response = await axios.post(
                tokenUri,
                params,
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                }
            );

            const { access_token, refresh_token } = response.data;

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            const payload = JSON.parse(atob(access_token.split(".")[1]));
            const roles = payload.resource_access?.[clientId]?.roles || [];
            console.log(roles);

                await axiosInstance.post(`${userUrl}/visitor/verify-doctor-role`, {}, {headers:{Authorization:`Bearer ${access_token}`}}).then(()=>{
                    if (roles.includes("doctor")) {
                        if (CookieManagerService.tokenIsExists("access_token")) {
                            setLoading(false);
                            if (onLogin) onLogin(username);
                            localStorage.setItem("email", username);
                            navigateTo("/context");
                        }
                    } else {
                        setLoading(false);
                        setError("You are not registered as a doctor. Please contact admin.");
                    }
                })

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
        } catch (error:never) {
            setLoading(false);
            if(error.code === "ERR_NETWORK"){
                setError("Network error. Please check your connection.");
                return;
            }
            console.log(error)
            setError(error.response.data.error_description);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                marginLeft:"10px",
                marginRight:"10px",
                mx:"auto"
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    minWidth: 350,
                    maxWidth: 400,
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                    }}
                >
                    Doctor Login
                </Typography>
                <form >
                    <TextField
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Typography
                            color="error"
                            sx={{ mt: 1, mb: 1, fontSize:"14px" }}
                        >
                            {error}
                        </Typography>
                    )}
                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !username || !password}
                            fullWidth
                            onClick={(e)=>{
                                handleSubmit(e)
                            }}
                            sx={{
                                height: 48,
                                fontWeight: "bold",
                                fontSize: "1rem",
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                />
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </Box>
                </form>

            </Paper>
        </Box>
    );
}
export default Login;
