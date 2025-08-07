import { createTheme } from "@mui/material/styles"

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#00C565" },         // Green for buttons/active elements
        secondary: { main: "#008A47" },       // Darker green for accents
        background: {
            default: "#ffffff",                 // Pure white background
            paper: "#f6f5f5",                   // Light gray for cards/surfaces
        },
        text: {
            primary: "#1a1a1a",                 // Almost black for high contrast
            secondary: "#4d4d4d",               // Medium gray for secondary text
        },
    },
})

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#00C06B" },         // Green for buttons/active elements
        secondary: { main: "#00A75F" },       // Darker green for accents
        background: {
            default: "#0d0d0d",                 // Deep black for app background
            paper: "#1a1a1a",                   // Dark gray for cards/surfaces
        },
        text: {
            primary: "#f5f5f5",                 // Light gray for primary text
            secondary: "#bfbfbf",               // Muted gray for secondary text
        },
    },
})
