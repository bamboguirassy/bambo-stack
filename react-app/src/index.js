/*!
=========================================================
* Muse Ant Design Dashboard - v1.0.0
=========================================================
* Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React, { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { createRoot } from "react-dom/client";
import "./assets/styles/main.css";
import { UserProvider } from "./providers/UserProvider";
import { PusherProvider } from "./providers/PusherProvider";
import * as serviceWorker from './serviceWorkerRegistration';


const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
      <PusherProvider>
        <App />
        </PusherProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);


serviceWorker.register(); // Enregistrez le service worker