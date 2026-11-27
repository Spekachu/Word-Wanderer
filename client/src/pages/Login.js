import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { t } = useTranslation();
  const { login, isDemoMode } = useAuth();

  if (isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-md w-full space-y-6 bg-white/10 border border-white/25 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-pacifico text-orange-300">Demo Mode</h2>
          <p className="text-sm text-orange-100">
            User accounts are disabled in this single-session proof of concept. You can explore the Word Map right away—your discovered words, stickers, and highlights are saved locally in your browser.
          </p>
          <Link
            to="/map"
            className="inline-block bg-white/15 border border-white hover:bg-white hover:text-rose-900 transition-colors font-bold py-2 px-6 rounded-lg"
          >
            {t('home.exploreTheWordMap')}
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-pacifico ">
          {t('login.title')}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-900 focus:border-rose-900 focus:z-10 sm:text-sm"
                placeholder={t('login.email')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-900 focus:border-rose-900 focus:z-10 sm:text-sm"
                placeholder={t('login.password')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-rose-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-900"
            >
              {t('login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;