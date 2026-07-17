import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css';

import Navbar1 from "./components/NavBar_1/navbar1";
import Navbar_2 from './components/NavBar_2/navbar_2';
import SignUp from "./pages/SignUp/signUp";
import Login from "./pages/Login/login";
import LandingPage from "./pages/LandingPage/landingPage";
import Profile from './pages/Profile/profile';
import Feeds from './pages/Feeds/feeds';
import MyNetwork from './pages/MyNetwork/myNetwork';

import Messages from './pages/Messages/messages';
import Notification from './pages/Notification/notification';
import AllActivities from './pages/AllActivities/allActivities';
import SingleActivity from './pages/SingleActivity/singleActivity';
import Job from './pages/Job/job';

function App() {
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isLogin') === 'true');
  const location = useLocation();

  const changeLoginValue = (val) => {
    setIsLogin(val);
  };

  const isCVPage = location.pathname.startsWith('/create-cv');

  return (
    <div className="relative w-full h-screen">
      {!isCVPage && (isLogin ? <Navbar_2 /> : <Navbar1 />)}

      <Routes>
        <Route
          path="/"
          element={
            isLogin ? (
              <Navigate to="/feeds" />
            ) : (
              <div className="split-container">
                <div className="left-side">
                  <div className="circle-container">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                  </div>
                  <div className="text-container">
                    <h1>Grow your professional network</h1>
                    <p>
                      Connect with industry leaders, discover opportunities,
                      and build the career you deserve — all in one place.
                    </p>
                  </div>
                </div>

                <div className="right-side">
                  <LandingPage changeLoginValue={changeLoginValue} />
                </div>
              </div>
            )
          }
        />

        <Route path="/signUp" element={isLogin ? <Navigate to="/feeds" /> : <SignUp changeLoginValue={changeLoginValue} />} />
        <Route path="/login" element={isLogin ? <Navigate to="/feeds" /> : <Login changeLoginValue={changeLoginValue} />} />
        <Route path="/feeds" element={isLogin ? <Feeds /> : <Navigate to="/login" />} />
        <Route path="/myNetwork" element={isLogin ? <MyNetwork /> : <Navigate to="/login" />} />
        <Route path="/job" element={isLogin ? <Job /> : <Navigate to="/login" />} />
        <Route path="/job/:jobId" element={isLogin ? <Job /> : <Navigate to="/login" />} />

        <Route path="/messages" element={isLogin ? <Messages /> : <Navigate to="/login" />} /> 
        <Route path="/notification" element={isLogin ? <Notification /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={isLogin ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/profile/:id/activities" element={isLogin ? <AllActivities /> : <Navigate to="/login" />} />
        <Route path="/profile/:id/activities/:postId" element={isLogin ? <SingleActivity /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;