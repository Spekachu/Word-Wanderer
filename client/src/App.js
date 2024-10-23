import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import WordMap from './components/WordMap';
import ContentWindow from './components/ContentWindow';
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
function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <WordProvider>
            <div className="App w-full h-dvh flex flex-col text-white animate-gradient font-nunito" 
              style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
              <div className="flex-grow overflow-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/map" element={
                    <AppWindow>
                      <WordMap />
                      <ContentWindow />
                    </AppWindow>
                  } />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
              <MainMenu />
              <NotificationDisplay />
            </div>
          </WordProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;