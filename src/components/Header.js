import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { useHistory } from "react-router-dom";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  
  const history = useHistory();
  if(hasHiddenAuthButtons){
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            history.push("/");
          }}
        >
          Back to explore
        </Button>
      </Box>
    );
  } else {
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children}
        {localStorage.getItem("token") ? 
        (
        <Stack flexDirection="row" alignItems="center">
          <Avatar 
            src="/avatar.png"  
            alt={localStorage.getItem("username")}
          />
        <p style={{marginLeft: "8px"}}>
          {localStorage.getItem("username")}</p>
          <Button sx={{marginLeft: "8px"}}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          > 
            Logout
          </Button>
        </Stack>
        ) : (
        <Box>
          <Button sx={{marginLeft: "12px"}}
            onClick={() => {
              history.push("/login");
            }}
          > 
          Login
          </Button>  
          <Button variant="contained"
            onClick={() => {
              history.push("/register");
            }}
          >   
          Register
          </Button>  
        </Box>
        )}
      </Box>
    );
    
  }
};

export default Header;
