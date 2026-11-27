import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { t } = useTranslation();
  const { register, isDemoMode } = useAuth();
  const { addNotification } = useNotification();

  if (isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-md w-full space-y-6 bg-white/10 border border-white/25 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-pacifico text-orange-300">Demo Mode</h2>
          <p className="text-sm text-orange-100">
            Registration is disabled in this single-session proof of concept. You can explore the Word Map right away—your discovered words, stickers, and highlights are saved locally in your browser.
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

    if (formData.password !== formData.confirmPassword) {
      addNotification(t('register.passwordMismatch'), 'error');
      return;
    }

    await register(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-pacifico">
          {t('register.title')}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('register.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-900 focus:border-rose-900 focus:z-10 sm:text-sm"
                placeholder={t('register.email')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('register.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-900 focus:border-rose-900 focus:z-10 sm:text-sm"
                placeholder={t('register.password')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                {t('register.confirmPassword')}
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-900 focus:border-rose-900 focus:z-10 sm:text-sm"
                placeholder={t('register.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-rose-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-900"
            >
              {t('register.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;