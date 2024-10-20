import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const Profile = () => {
	const navigate = useNavigate();
	const { currentUser, updatePassword, sendPasswordResetEmail, deleteUser, logout } = useAuth();
	const { addNotification } = useNotification();
	const currentPasswordRef = useRef();
	const newPasswordRef = useRef();
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [deleteConfirmed, setDeleteConfirmed] = useState(false);

	const handlePasswordChange = async (e) => {
		e.preventDefault();

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
		if (!currentUser) {
			navigate('/');
		}
	}, [currentUser, navigate]);

	if (!currentUser) return null;

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<h1 className="mt-6 text-center text-3xl font-pacifico">Profile</h1>
				<p className="text-center text-lg">Email: {currentUser.email}</p>

				<form onSubmit={handlePasswordChange} className="mt-8 space-y-6">
					<h2 className="text-2xl font-bold mb-4">Change Password</h2>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="currentPassword" className="sr-only">Current Password:</label>
							<input
								type="password"
								id="currentPassword"
								ref={currentPasswordRef}
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Current Password"
							/>
						</div>
						<div>
							<label htmlFor="newPassword" className="sr-only">New Password:</label>
							<input
								type="password"
								id="newPassword"
								ref={newPasswordRef}
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="New Password"
							/>
						</div>
					</div>
					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Update Password
						</button>
					</div>
				</form>

				<div className="mt-4">
					<button
						onClick={handleForgotPassword}
						className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg border border-white hover:bg-white text-white hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
