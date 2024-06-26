// import React, { useContext } from 'react';
import React, { useState } from "react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig, loginRequest } from "../config/msalConfig";
import DigitalClock from "../components/DigitalClock";

// import { AuthContext } from '../context/AuthContext'; // Importing AuthContext using curly braces

const msalInstance = new PublicClientApplication(msalConfig);

if (
  !msalInstance.getActiveAccount() &&
  msalInstance.getAllAccounts().length > 0
) {
  msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

const LoginButton = () => {
  const [account, setAccount] = useState(null);
  const [userData, setUserData] = useState(null);
  // const { login } = useContext(AuthContext);

  const login = async () => {
    try {
      const loginResponse = await msalInstance.loginRedirect({
        ...loginRequest,
        prompt: "create",
      });
      setAccount(loginResponse.account);
      setUserData(loginResponse.account);

      console.log(account, userData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="navbar-login">
        <div className="DemocracyU">DemocracyU</div>
      </div>
      <DigitalClock />
      <div className="login-container">
        <button onClick={login} className="button-login">
          <img
            src="https://cdn-icons-png.freepik.com/512/732/732221.png"
            alt="Login Icon"
            className="login-icon"
          />
          Login with Microsoft
        </button>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <LoginButton />
    </MsalProvider>
  );
};

export default LoginPage;
