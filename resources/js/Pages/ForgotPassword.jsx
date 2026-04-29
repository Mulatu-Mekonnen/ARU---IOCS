import React from 'react';
import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Mail, ArrowLeft, Send, CheckCircle, Shield, Lock, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const [emailSent, setEmailSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password', {
            preserveScroll: true,
            onSuccess: () => {
                setEmailSent(true);
                reset('email');
                setTimeout(() => {
                    // Optional: Redirect to login after 5 seconds
                    // window.location.href = '/login';
                }, 5000);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Forgot Password" />
            
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
                            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                            <p className="mt-2 text-indigo-100 text-sm">
                                Don't worry, we'll help you recover your account
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                        {!emailSent ? (
                            <>
                                {/* Flash Message */}
                                {flash.status && (
                                    <div className="mb-6 animate-slideDown">
                                        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-green-800">{flash.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                                        <Mail className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Enter your email address below and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={submit} className="space-y-6">
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
                                                placeholder="you@example.com"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                Send Reset Link
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Help Text */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <Shield className="w-3 h-3" />
                                        <span>Secure password recovery</span>
                                        <Lock className="w-3 h-3 ml-2" />
                                        <span>Encrypted link</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center animate-fadeIn">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    We've sent a password reset link to:
                                </p>
                                <p className="font-semibold text-indigo-600 mb-6 break-all">
                                    {data.email}
                                </p>
                                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                    <p className="text-xs text-blue-800">
                                        📧 Didn't receive the email? Check your spam folder or 
                                        <button
                                            onClick={() => {
                                                setEmailSent(false);
                                                reset();
                                            }}
                                            className="text-blue-600 font-medium hover:underline ml-1"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    
                </div>

                {/* Additional Security Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        <Shield className="w-3 h-3 inline mr-1" />
                        This is a secure system. Your information is protected.
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