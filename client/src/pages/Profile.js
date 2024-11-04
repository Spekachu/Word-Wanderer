import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useVerifyCurrentPassword } from '../api/useVerifyCurrentPassword';

const Profile = () => {
	const navigate = useNavigate();
	const { checkAuth, currentUser, updatePassword, sendPasswordResetEmail, deleteUser, logout, userWordAssociations, getAuthHeaders } = useAuth();
	const { addNotification } = useNotification();
	const currentPasswordRef = useRef();
	const newPasswordRef = useRef();
	const newPasswordConfirmRef = useRef();
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [deleteConfirmed, setDeleteConfirmed] = useState(false);
	const [passwordError, setPasswordError] = useState('');
	const { t } = useTranslation();

	const handlePasswordChange = async (e) => {
		e.preventDefault();
		setPasswordError('');

		const newPassword = newPasswordRef.current.value;
		const newPasswordConfirm = newPasswordConfirmRef.current.value;

		if (newPassword !== newPasswordConfirm) {
			setPasswordError(t('passwordErrors.newPasswordsDontMatch'));
			return;
		}

		try {
			const isCurrentPasswordValid = await useVerifyCurrentPassword(
				currentUser.email, 
				currentPasswordRef.current.value,
				getAuthHeaders
			);
			
			if (!isCurrentPasswordValid) {
				addNotification(t('profile.currentPasswordIncorrect'), 'error');
				return;
			}

			await updatePassword(newPasswordRef.current.value);
			addNotification(t('profile.passwordUpdateSuccess'), 'success');
			currentPasswordRef.current.value = '';
			newPasswordRef.current.value = '';
			newPasswordConfirmRef.current.value = '';
		} catch (error) {
			addNotification(t('profile.passwordUpdateFail'), 'error');
		}
	};

	const handleForgotPassword = async () => {
		try {
			await sendPasswordResetEmail(currentUser.email);
			addNotification(t('profile.passwordResetEmailSent'), 'success');
		} catch (error) {
			addNotification(t('profile.passwordResetEmailFail'), 'error');
		}
	};

	const handleDeleteProfile = () => {
		setShowDeleteConfirmation(true);
	};

	const confirmDeleteProfile = async () => {
		if (!deleteConfirmed) {
			addNotification(t('profile.deleteConfirmRequired'), 'error');
			return;
		}

		try {
			await deleteUser();
			logout();
			addNotification(t('profile.deleteSuccess'), 'success');
			navigate('/');
		} catch (error) {
			addNotification(t('profile.deleteFail'), 'error');
		}
	};

	useEffect(() => {
		const verifyAuth = async () => {
			if (!currentUser) {
				const isAuthenticated = await checkAuth();
				if (!isAuthenticated) {
					logout();
					navigate('/login');
				}
			}
		};

		verifyAuth();
	}, [currentUser, checkAuth, logout, navigate]);

	if (!currentUser) return null;

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<h1 className="mt-6 text-center text-4xl font-pacifico">{t('profile.title')}</h1>
				<p className="text-center text-lg">{t('profile.email')}: {currentUser.email}</p>

				{userWordAssociations && (
					<div>
						<p className="text-center text-lg">{t('profile.wordsWandered', { count: Object.keys(userWordAssociations).length })}</p>
						{['en', 'fr', 'de', 'es'].map(lang => {
							const count = Object.values(userWordAssociations).filter(word => word.languageCodes?.includes(lang)).length;
							return count > 0 && (
								<p key={lang} className="text-center text-lg">
									{count} {t('profile.inLanguage', { language: t(`languages.${lang}`) })}
								</p>
							);
						})}
					</div>
				)}

				<form onSubmit={handlePasswordChange} className="mt-8 space-y-6">
					<h2 className="text-2xl font-bold mb-4">{t('profile.changePassword')}</h2>
					<div className="space-y-4">
						{['currentPassword', 'newPassword', 'confirmNewPassword'].map((field) => (
							<div key={field} className="relative">
								<input
									type="password"
									id={field}
									ref={field === 'currentPassword' ? currentPasswordRef : field === 'newPassword' ? newPasswordRef : newPasswordConfirmRef}
									required
									className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-white bg-white appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer"
									placeholder=" "
								/>
								<label
									htmlFor={field}
									className="absolute pointer-events-none text-sm rounded-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
								>
									{t(`profile.${field}`)}
								</label>
							</div>
						))}
					</div>
					{passwordError && (
						<p className="text-red-400 text-sm mt-2">{t(passwordError)}</p>
					)}
					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
							disabled={passwordError !== ''}
						>
							{t('profile.updatePassword')}
						</button>
					</div>
				</form>

				<div className="mt-4">
					<button
						onClick={handleForgotPassword}
						className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
					>
						{t('profile.forgotPassword')}
					</button>
				</div>

				<div className="mt-4">
					<button
						onClick={handleDeleteProfile}
						className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border bg-red-100 border-red-700 text-red-700 hover:bg-red-500 hover:text-white transition-colors"
					>
						{t('profile.deleteProfile')}
					</button>
				</div>

				{showDeleteConfirmation && (
					<div className="mt-4 p-4 border border-red-500 rounded-lg bg-orange-900">
						<h3 className="text-lg font-semibold mb-2">{t('profile.deleteConfirmTitle')}</h3>
						<p className="mb-4">{t('profile.deleteConfirmMessage')}</p>
						<div className="flex items-center mb-4">
							<input
								type="checkbox"
								id="deleteConfirm"
								checked={deleteConfirmed}
								onChange={(e) => setDeleteConfirmed(e.target.checked)}
								className="mr-2"
							/>
							<label htmlFor="deleteConfirm">
								{t('profile.deleteConfirmCheckbox')}
							</label>
						</div>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowDeleteConfirmation(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								{t('common.cancel')}
							</button>
							<button
								onClick={confirmDeleteProfile}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								{t('profile.confirmDelete')}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;