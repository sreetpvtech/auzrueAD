import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.REDIRECT_URI
  }
};
console.log("MSAL Config:", msalConfig);

const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest = {
  scopes: ["user.read"]
};

window.signIn = async function () {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    console.log("Login successful:", loginResponse);
    getUserProfile(loginResponse.account);
  } catch (error) {
    console.error("Login error:", error);
  }
};

window.signOut = function () {
  const logoutRequest = {
    account: msalInstance.getActiveAccount()
  };
  msalInstance.logoutPopup(logoutRequest);
};

async function getUserProfile(account) {
  msalInstance.setActiveAccount(account);
  const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
  const accessToken = tokenResponse.accessToken;

  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const profile = await response.json();
  document.getElementById("profile").textContent = JSON.stringify(profile, null, 2);
}

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
  getUserProfile(accounts[0]);
}
