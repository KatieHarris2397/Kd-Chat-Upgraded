import { indigo, teal } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
 
export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
        main: indigo[500],
    },
    secondary: {
        main: teal[500],
    }
  },
  components: {
    // Inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: teal[500],
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: indigo[500],
            },
          },
        },
      }
    }
  }
});