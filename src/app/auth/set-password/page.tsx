'use client';

import { useState } from 'react';
import { setPassword } from './actions';

export default function SetPasswordPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await setPassword(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // redirect happens on server on success
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h1 className="h1 text-2xl mb-6 font-bold text-center">Set Your Password</h1>
                <p className="text-gray-600 mb-6 text-center">
                    Please set a password for your account to continue. You can use this password to log in next time.
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input-field w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="btn-primary w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Setting Password...' : 'Save Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
