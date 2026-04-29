import React from 'react';
import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle, 
  Shield,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export default function ResetPassword() {
    const { props, flash } = usePage();
    const { token, email } = props;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [resetSuccess, setResetSuccess] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            preserveScroll: true,
            onSuccess: () => {
                setResetSuccess(true);
                reset();
                setTimeout(() => {
                    // Redirect to login after 3 seconds
                    window.location.href = '/login';
                }, 3000);
            },
        });
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setData('password', newPassword);
        checkPasswordStrength(newPassword);
    };

    const getStrengthColor = () => {
        switch(passwordStrength) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getStrengthText = () => {
        switch(passwordStrength) {
            case 0: return 'No password';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Reset Password" />
            
            <div className="max-w-md w-full">
                {/* Back to Login Link */}
                <div className="mb-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Login</span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
                        <div className="relative text-center">
                            <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                                <KeyRound className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                            <p className="mt-2 text-indigo-100 text-sm">
                                Create a new secure password for your account
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                        {!resetSuccess ? (
                            <>
                                {/* Flash Message */}
                                {flash?.error && (
                                    <div className="mb-6 animate-slideDown">
                                        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-red-800">{flash.error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                                        <Lock className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Please enter your new password below. Make sure it's strong and secure.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={submit} className="space-y-5">
                                    <input type="hidden" name="token" value={data.token} />

                                    {/* Email Field */}
                                    <div className="group">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="you@example.com"
                                                required
                                                readOnly={!!email}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="group">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={handlePasswordChange}
                                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="Enter new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        {data.password && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex gap-1 flex-1 mr-2">
                                                        <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 1 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                                                        <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 2 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                                                        <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 3 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                                                        <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 4 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                                                    </div>
                                                    <span className="text-xs font-medium" style={{ color: getStrengthColor().replace('bg-', 'text-') }}>
                                                        {getStrengthText()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Use 8+ characters with mix of letters, numbers & symbols
                                                </p>
                                            </div>
                                        )}
                                        
                                        {errors.password && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="group">
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="Confirm your new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                Passwords do not match
                                            </p>
                                        )}
                                        {errors.password_confirmation && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="bg-blue-50 rounded-xl p-3">
                                        <p className="text-xs font-medium text-blue-800 mb-2">Password requirements:</p>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${data.password.length >= 8 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                                                At least 8 characters
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(data.password) && /[a-z]/.test(data.password) ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                                                Uppercase and lowercase letters
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(data.password) ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                                                At least one number
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z\d]/.test(data.password) ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                                                At least one special character
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Help Text */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <Shield className="w-3 h-3" />
                                        <span>Secure password reset</span>
                                        <Lock className="w-3 h-3 ml-2" />
                                        <span>Encrypted connection</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center animate-fadeIn">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    Your password has been successfully reset.
                                </p>
                                <div className="bg-green-50 rounded-xl p-4 mb-6">
                                    <p className="text-xs text-green-800">
                                        🔐 You will be redirected to the login page in a few seconds.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                                >
                                    Proceed to Login
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="text-center text-xs text-gray-500">
                            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Resend reset link?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Additional Security Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        <Shield className="w-3 h-3 inline mr-1" />
                        This link expires in 60 minutes for security reasons.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}