import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
	const navigate = useNavigate();
	const { isLoggedIn, checkAuth, currentUser, updatePassword, sendPasswordResetEmail, deleteUser, logout, userWordAssociations } = useAuth();
	const { addNotification } = useNotification();
	const currentPasswordRef = useRef();
	const newPasswordRef = useRef();
	const newPasswordConfirmRef = useRef();
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [deleteConfirmed, setDeleteConfirmed] = useState(false);
	const [passwordError, setPasswordError] = useState('');
  const { t, i18n } = useTranslation();

	const handlePasswordChange = async (e) => {
		e.preventDefault();
		setPasswordError('');

		const newPassword = newPasswordRef.current.value;
		const newPasswordConfirm = newPasswordConfirmRef.current.value;

		if (newPassword !== newPasswordConfirm) {
			setPasswordError("*New passwords don't match");
			return;
		}

		try {
			const isCurrentPasswordValid = await verifyCurrentPassword(
				currentUser.email, 
				currentPasswordRef.current.value
			);
			
			if (!isCurrentPasswordValid) {
				addNotification('Current password is incorrect', 'error');
				return;
			}

			await updatePassword(newPasswordRef.current.value);
			addNotification('Password updated successfully', 'success');
			currentPasswordRef.current.value = '';
			newPasswordRef.current.value = '';
			newPasswordConfirmRef.current.value = '';
		} catch (error) {
			addNotification('Failed to update password', 'error');
		}
	};

	const handleForgotPassword = async () => {
		try {
			await sendPasswordResetEmail(currentUser.email);
			addNotification('Password reset email sent', 'success');
		} catch (error) {
			addNotification('Failed to send password reset email', 'error');
		}
	};

	const handleDeleteProfile = () => {
		setShowDeleteConfirmation(true);
	};

	const confirmDeleteProfile = async () => {
		if (!deleteConfirmed) {
			addNotification('Please confirm that you understand the consequences', 'error');
			return;
		}

		try {
			await deleteUser();
			logout();
			addNotification('Your profile has been deleted', 'success');
			navigate('/');
		} catch (error) {
			addNotification('Failed to delete profile', 'error');
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
				<h1 className="mt-6 text-center text-4xl font-pacifico">Profile</h1>
				<p className="text-center text-lg">Email: {currentUser.email}</p>

				{userWordAssociations && (
					<div>
						<p className="text-center text-lg">You've wandered through {Object.keys(userWordAssociations).length} words.</p>
						{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('en')).length > 0 && (
							<p className="text-center text-lg">{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('en')).length} in {t('languages.en')}</p>
						)}
						{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('fr')).length > 0 && (
							<p className="text-center text-lg">{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('fr')).length} in {t('languages.fr')}</p>
						)}
						
						{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('de')).length > 0 && (
							<p className="text-center text-lg">{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('de')).length} in {t('languages.de')}</p>
						)}
						{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('es')).length > 0 && (
							<p className="text-center text-lg">{Object.values(userWordAssociations).filter(word => word.languageCodes?.includes('es')).length} in {t('languages.es')}</p>
						)}
					</div>
				)}

				<form onSubmit={handlePasswordChange} className="mt-8 space-y-6">
					<h2 className="text-2xl font-bold mb-4">Change Password</h2>
					<div className="space-y-4">
						<div className="relative">
							<input
								type="password"
								id="currentPassword"
								ref={currentPasswordRef}
								required
								className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-white bg-white appearance-none focus:outline-none focus:ring-0 focus:border-fuchsia-600 peer"
								placeholder=" "
							/>
							<label
								htmlFor="currentPassword"
								className="absolute pointer-events-none text-sm rounded-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-fuchsia-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
							>
								Current Password
							</label>
						</div>
						<hr />
						<div className="relative">
							<input
								type="password"
								id="newPassword"
								ref={newPasswordRef}
								required
								className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-white bg-white appearance-none focus:outline-none focus:ring-0 focus:border-fuchsia-600 peer"
								placeholder=" "
							/>
							<label
								htmlFor="newPassword"
								className="absolute pointer-events-none text-sm rounded-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-fuchsia-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
							>
								New Password
							</label>
						</div>
						<div className="relative">
							<input
								type="password"
								id="newPasswordConfirm"
								ref={newPasswordConfirmRef}
								required
								className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-white bg-white appearance-none focus:outline-none focus:ring-0 focus:border-fuchsia-600 peer"
								placeholder=" "
							/>
							<label
								htmlFor="newPasswordConfirm"
								className="absolute pointer-events-none text-sm rounded-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-fuchsia-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
							>
								Confirm New Password
							</label>
						</div>
					</div>
					{passwordError && (
						<p className="text-red-400 text-sm mt-2">{passwordError}</p>
					)}
					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
							disabled={passwordError !== ''}
						>
							Update Password
						</button>
					</div>
				</form>

				<div className="mt-4">
					<button
						onClick={handleForgotPassword}
						className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
					>
						Forgot Password?
					</button>
				</div>

				<div className="mt-4">
					<button
						onClick={handleDeleteProfile}
						className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border bg-red-100 border-red-700 text-red-700 hover:bg-red-500 hover:text-white transition-colors"
					>
						Delete Profile
					</button>
				</div>

				{showDeleteConfirmation && (
					<div className="mt-4 p-4 border border-red-500 rounded-lg bg-orange-900">
						<h3 className="text-lg font-semibold mb-2">Are you sure you want to delete your profile?</h3>
						<p className="mb-4">This action cannot be undone.</p>
						<div className="flex items-center mb-4">
							<input
								type="checkbox"
								id="deleteConfirm"
								checked={deleteConfirmed}
								onChange={(e) => setDeleteConfirmed(e.target.checked)}
								className="mr-2"
							/>
							<label htmlFor="deleteConfirm">
								I understand that all my progress in the app will be deleted
							</label>
						</div>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowDeleteConfirmation(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								Cancel
							</button>
							<button
								onClick={confirmDeleteProfile}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Yes, Delete My Profile
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;

// This function should be implemented to verify the current password with your backend
const verifyCurrentPassword = async (email, password) => {
	// Implement your API call to verify the password
	// Return true if the password is correct, false otherwise
};
