import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { WordProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppWindow } from './pages/AppWindow';
import { MainMenu } from './components/MainMenu';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import NotificationDisplay from './components/NotificationDisplay';
import Profile from './pages/Profile';
import Starfield from 'react-starfield';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <WordProvider>
            <div className="App relative w-full h-full box-content flex flex-col text-white font-nunito pt-[env(safe-area-inset-top)]">
              <div className="flex-grow overflow-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/map" element={
                    <AppWindow/>
                  } />
									<Route path="/register" element={<Register />} />
									<Route path="/login" element={<Login />} />
									<Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
							<MainMenu />
              <NotificationDisplay />
            </div>
						<div className="hidden md:block fixed top-0 left-0 w-full h-full mix-blend-screen pointer-events-none z-10">
							<Starfield
							starCount={1000}
							starColor={[255, 255, 255]}
							speedFactor={0.03}
							backgroundColor="black"
							/>
						</div>
          </WordProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;