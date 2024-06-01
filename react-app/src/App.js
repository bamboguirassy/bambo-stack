import { Route, Routes } from "react-router-dom";
import { ConfigProvider } from 'antd';

// import "antd/dist/antd.css";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/responsive.css";
import { useUserContext } from "./providers/UserProvider";
import React from "react";
import GroupeListPage from "./pages/groupe/GroupeListPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserListPage from "./pages/user/UserListPage";
import UserDetailsPage from "./pages/user/UserDetailsPage";
import Moment from 'react-moment';
import 'moment/locale/fr';
import moment from 'moment-timezone';
import frFR from 'antd/locale/fr_FR';
import ResetPasswordViaTokenPage from "./pages/user/ResetPasswordViaTokenPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import GroupeDetailsPage from "./pages/groupe/GroupeDetailsPage";
import { usePusher } from "./providers/PusherProvider";

// Sets the moment instance to use.
Moment.globalMoment = moment;
// Set the locale for every react-moment instance to French.
Moment.globalLocale = 'fr';
// Set the output format for every react-moment instance.
Moment.globalFormat = 'D MMM YYYY';
// Set time zone for every react-moment instance : Africa/Dakar
Moment.globalTimezone = 'Africa/Dakar';
// Set the output timezone for local for every instance.
Moment.globalLocal = true;
// Use a <span> tag for every react-moment instance.
Moment.globalElement = 'span';
// set antd locale to fr

function App() {

  const { getCurrentUser, currentUser } = useUserContext();
  const pusher = usePusher();

  React.useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  React.useEffect(() => {
    if (currentUser && pusher) {
      const channelName = `private-App.Models.User.${currentUser.id}`;
      // const channelName = `test-channel`;
      const channel = pusher.subscribe(channelName);

      channel.bind('test-event', function (data) {
        console.log(data);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [pusher, currentUser]);


  return (
    <ConfigProvider locale={frFR}
      theme={{
        // algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: process.env.REACT_APP_PRIMARY_COLOR,
          borderRadius: 5,
        }

      }}
    >
      <div className="App">
        <Routes>
          <Route path="/login" exact element={<LoginPage />} />
          <Route exact path="/dashboard" element={<HomePage />} />
          <Route exact path="/parametrage/groupe" element={<GroupeListPage />} />
          <Route exact path="/parametrage/groupe/:uid" element={<GroupeDetailsPage />} />
          <Route exact path="/parametrage/user" element={<UserListPage />} />
          <Route exact path="/parametrage/user/:uid" element={<UserDetailsPage />} />
          <Route exact path="/profile" element={<UserProfilePage />} />
          <Route exact path="/verify-email/:token" element={<ResetPasswordViaTokenPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {
            currentUser ?
              <Route path="*" element={<HomePage />} /> :
              <Route path="*" element={<LoginPage />} />
          }
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;
