import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';

export const MainMenu = () => {
	const { isLoggedIn, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isWordMapRoute = location.pathname === '/map';

  const {
    partOfSpeech, set_partOfSpeech,
    cefrLevel, set_cefrLevel,
    userLanguage, set_userLanguage,
    userLearningLanguage, set_userLearningLanguage,
    setActiveContent,
    setShowEmojiPicker,
    setShowHighlightPicker
  } = useContext(AppContext);

  const handleLanguageChange = (language, isUserLanguage) => {
    if (isUserLanguage) {
      set_userLanguage(language);
      i18n.changeLanguage(language);
    } else {
      set_userLearningLanguage(language);
    }
    resetContentWindow();
  };

  const switchLanguages = () => {
    const temp = userLanguage;
    set_userLanguage(userLearningLanguage);
    i18n.changeLanguage(userLearningLanguage);
    set_userLearningLanguage(temp);
    resetContentWindow();
  };

  const handleLevelChange = (level) => {
    set_cefrLevel(level);
    resetContentWindow();
  };

  const handlePartOfSpeechChange = (pos) => {
    set_partOfSpeech(pos);
    resetContentWindow();
  };

  const resetContentWindow = () => {
    setActiveContent(false);
    setShowEmojiPicker(false);
    setShowHighlightPicker(false);
  };

  return (
    <div id="MainMenu" className="fixed text-white p-2 top-0 flex items-center justify-between w-full backdrop-blur-xl bg-black/5 border-b border-white">
      <div className="flex items-center">
        <Link to="/" className="text-white hover:text-gray-300 mr-4 py-2">Home</Link>
        <Link to="/map" className="text-white hover:text-gray-300 mr-4 py-2">Word Map</Link>
        {!isLoggedIn && (
          <>
            <Link to="/register" className="text-white hover:text-gray-300 mr-4 py-2">Register</Link>
            <Link to="/login" className="text-white hover:text-gray-300 mr-4 py-2">Login</Link>
          </>
        )}
        {isLoggedIn && (
          <button onClick={logout} className="text-white hover:text-gray-300 py-2">Logout</button>
        )}
      </div>

      {isWordMapRoute && (
        <div className="flex items-center">
          <select
            value={userLanguage}
            onChange={(e) => handleLanguageChange(e.target.value, true)}
            className="bg-transparent text-white border border-white rounded p-1"
          >
            <option className='text-black hover:bg-slate-900' value="en">{t('languages.en')}</option>
            <option className='text-black' value="de">{t('languages.de')}</option>
            <option className='text-black' value="fr">{t('languages.fr')}</option>
            <option className='text-black' value="es">{t('languages.es')}</option>
          </select>

          <FaArrowRightArrowLeft 
            className="mx-2 cursor-pointer"
            onClick={switchLanguages} 
          />

          <select
            value={userLearningLanguage}
            onChange={(e) => handleLanguageChange(e.target.value, false)}
            className="bg-transparent text-white border border-white rounded p-1 mr-4"
          >
            <option className='text-black' value="en">{t('languages.en')}</option>
            <option className='text-black' value="de">{t('languages.de')}</option>
            <option className='text-black' value="fr">{t('languages.fr')}</option>
            <option className='text-black' value="es">{t('languages.es')}</option>
          </select>

          <select
            value={cefrLevel}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="bg-transparent text-white border border-white rounded p-1 mr-4"
          >
            <option className='text-black' value="a1">A1</option>
            <option className='text-black' value="a2">A2</option>
            <option className='text-black' value="b1">B1</option>
            <option className='text-black' value="b2">B2</option>
            <option className='text-black' value="c1">C1</option>
            <option className='text-black' value="c2">C2</option>
          </select>

          <select
            value={partOfSpeech}
            onChange={(e) => handlePartOfSpeechChange(e.target.value)}
            className="bg-transparent text-white border border-white rounded p-1"
          >
            <option className='text-black' value="adjective">{t('partOfSpeech.adjective')}</option>
            <option className='text-black' value="noun">{t('partOfSpeech.noun')}</option>
            <option className='text-black' value="verb">{t('partOfSpeech.verb')}</option>
          </select>
        </div>
      )}
    </div>
  );
};