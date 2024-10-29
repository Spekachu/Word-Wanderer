import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { FaArrowRightArrowLeft, FaBars, FaFilter } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';
import { GrMapLocation } from "react-icons/gr";

export const MainMenu = () => {
	const { isLoggedIn, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isWordMapRoute = location.pathname === '/map';
	
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    closeMobileFilters();
  };

  const switchLanguages = () => {
    const temp = userLanguage;
    set_userLanguage(userLearningLanguage);
    i18n.changeLanguage(userLearningLanguage);
    set_userLearningLanguage(temp);
    resetContentWindow();
    closeMobileFilters();
  };

  const handleLevelChange = (level) => {
    set_cefrLevel(level);
    resetContentWindow();
    closeMobileFilters();
  };

  const handlePartOfSpeechChange = (pos) => {
    set_partOfSpeech(pos);
    resetContentWindow();
    closeMobileFilters();
  };

  const resetContentWindow = () => {
    setActiveContent(false);
    setShowEmojiPicker(false);
    setShowHighlightPicker(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

	const menuLinks = () => (
    <div className={`${showMobileMenu ? 'flex justify-center flex-wrap w-full pt-4 order-last' : 'hidden'} lg:flex items-center lg:order-1 lg:flex-row lg:w-auto lg:py-0`}>
      <Link to="/" className="text-white hover:text-fuchsia-300 mr-4 py-2" onClick={closeMobileMenu}>{t('menu.home')}</Link>
      <Link to="/map" className="text-white hover:text-fuchsia-300 mr-4 py-2" onClick={closeMobileMenu}>{t('menu.wordMap')}</Link>
      {!isLoggedIn && (
        <>
          <Link to="/register" className="text-white hover:text-fuchsia-300 mr-4 py-2" onClick={closeMobileMenu}>{t('menu.register')}</Link>
          <Link to="/login" className="text-white hover:text-fuchsia-300 mr-4 py-2" onClick={closeMobileMenu}>{t('menu.login')}</Link>
        </>
      )}
      {isLoggedIn && (
        <>
          <Link to="/profile" className="text-white hover:text-fuchsia-300 mr-4 py-2" onClick={closeMobileMenu}>{t('menu.profile')}</Link>
          <button onClick={() => { logout(); closeMobileMenu(); }} className="text-white hover:text-fuchsia-300 py-2">{t('menu.logout')}</button>
        </>
      )}
    </div>
  );

	const filters = () => (
		<div className={`${showMobileFilters ? 'flex justify-center flex-wrap w-full pt-4 pb-3 order-last' : 'hidden'} gap-2 md:flex items-center md:order-1 md:ml-auto md:mr-4 lg:mr-0 lg:ml-0 lg:order-3 md:flex-row md:w-auto md:py-0`}>
				<div className='flex items-center'>
					<select
						value={userLanguage}
						onChange={(e) => handleLanguageChange(e.target.value, true)}
						className="bg-transparent text-white border border-white rounded p-1"
					>
						<option className='text-black' value="en">{t('languages.en')}</option>
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
						className="bg-transparent text-white border border-white rounded p-1"
					>
						<option className='text-black' value="en">{t('languages.en')}</option>
						<option className='text-black' value="de">{t('languages.de')}</option>
						<option className='text-black' value="fr">{t('languages.fr')}</option>
						<option className='text-black' value="es">{t('languages.es')}</option>
					</select>
				</div>
				{isWordMapRoute && (
					<div className='flex items-center gap-2'>
						<select
							value={cefrLevel}
						onChange={(e) => handleLevelChange(e.target.value)}
						className="bg-transparent text-white border border-white rounded p-1"
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
							<option className='text-black' value="adjective">{t('partOfSpeech.adjective_other')}</option>
							<option className='text-black' value="noun">{t('partOfSpeech.noun_other')}</option>
							<option className='text-black' value="verb">{t('partOfSpeech.verb_other')}</option>
						</select>
					</div>
				)}
			</div>
	);

  return (
    <div id="MainMenu" className="fixed text-white pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pr-[calc(env(safe-area-inset-right)+0.5rem)] pl-[calc(env(safe-area-inset-left)+0.5rem)] top-0 flex items-center justify-center w-full backdrop-blur-xl bg-black/5 border-b border-white">
			<div className='flex items-center justify-between w-full max-w-screen-xl flex-wrap lg:flex-nowrap'>
				{/* this is the main menu links */}
				{menuLinks()}

				{/* this is the logo/branding for the menu nav */}
				
				<Link to="/" className="order-1 lg:order-2 lg:m-auto">
					<h2 className="text-2xl lg:text-3xl font-pacifico text-nowrap inline-flex items-center">Word Wanderer <GrMapLocation className="ml-2" /></h2>
				</Link>

				{/* this is the language selector and filters for the word map */}
				{filters()}
				<div className='flex items-center order-2'>
					<button 
						className={`text-2xl mr-2 p-2 rounded-md md:hidden transition-colors ${showMobileFilters ? 'text-fuchsia-900 bg-white' : ''}`} 
						onClick={() => setShowMobileFilters(!showMobileFilters)}
					>
						<FaFilter />
					</button>
					<button 
						className={`text-2xl p-2 rounded-md lg:hidden transition-colors ${showMobileMenu ? 'text-fuchsia-900 bg-white' : ''}`} 
						onClick={() => setShowMobileMenu(!showMobileMenu)}
					>
						<FaBars />
					</button>
				</div>
			</div>
    </div>
  );
};