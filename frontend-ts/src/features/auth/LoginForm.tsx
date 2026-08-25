import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/AuthSlice';
import { useLoginMutation } from '../../hooks/mutations/useAuthMutations';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, User, Lock } from 'lucide-react';
import logoUrl from '@/assets/pwa-192x192.png';

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(7, 'Password must be at least 7 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Maps known API error shapes to a friendly message.
// Falls back to a generic message rather than leaking raw server/network errors.
function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        const err = error as { status?: number; data?: { message?: string } };
        if (err.status === 401 || err.status === 400) {
            return 'Incorrect email or password. Please try again.';
        }
        if (err.status === 429) {
            return 'Too many attempts. Please wait a moment and try again.';
        }
        if (err.status && err.status >= 500) {
            return 'Something went wrong on our end. Please try again shortly.';
        }
        if (err.data?.message) {
            return err.data.message;
        }
    }
    if (error instanceof Error && error.message === 'Failed to fetch') {
        return 'Unable to reach the server. Check your connection and try again.';
    }
    return 'Invalid credentials. Please try again.';
}

export default function LoginForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loginMutation = useLoginMutation();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response: any = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            const user = response?.user || response?.data?.user;
            const token = response?.token || response?.data?.token || '';

            if (user) {
                dispatch(setCredentials({ user, token }));
                toast.success('Successfully logged in');
                navigate('/app');
            } else {
                toast.error('Unexpected login response format. Please try again.');
            }
        } catch (error) {
            console.error('Login failed', error);
            const message = getErrorMessage(error);
            toast.error(message);
            // Put focus back on the field most likely to need correction.
            setFocus('password');
        }
    };

    const busy = isSubmitting || loginMutation.isPending;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans text-foreground">
            <div className="flex flex-col items-center mb-8">
                <img src={logoUrl} alt="MessPro Logo" className="w-20 h-20 mb-4" />
                <h1 className="text-3xl font-bold tracking-tight mb-2">MessPro</h1>
                <p className="text-sm font-medium text-muted-foreground">Login to your account</p>
            </div>

            <div className="w-full max-w-[400px] bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8">
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email Address */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.email ? 'text-destructive' : 'text-muted-foreground'}`}>
                                <User className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                disabled={busy}
                                placeholder="e.g. yourname@domain.com"
                                aria-invalid={errors.email ? 'true' : 'false'}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                                className={`block w-full pl-10 pr-3 py-3 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:border-transparent transition-shadow duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${errors.email
                                    ? 'border-destructive focus:ring-destructive'
                                    : 'border-input focus:ring-ring'
                                    }`}
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p id="email-error" role="alert" className="text-xs text-destructive mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Password
                            </label>
                            <a
                                href="/forgot-password"
                                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.password ? 'text-destructive' : 'text-muted-foreground'}`}>
                                <Lock className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                disabled={busy}
                                placeholder="••••••••"
                                aria-invalid={errors.password ? 'true' : 'false'}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                className={`block w-full pl-10 pr-10 py-3 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:border-transparent transition-shadow duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${errors.password
                                    ? 'border-destructive focus:ring-destructive'
                                    : 'border-input focus:ring-ring'
                                    }`}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                disabled={busy}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" role="alert" className="text-xs text-destructive mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {loginMutation.isError && (
                        <div
                            role="alert"
                            className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl"
                        >
                            {getErrorMessage(loginMutation.error)}
                        </div>
                    )}

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold text-primary-foreground bg-primary rounded-xl shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            {busy && <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />}
                            {busy ? 'SIGNING IN…' : 'SIGN IN'}
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                                const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                const apiBase = rawApiUrl.replace(/\/api\/?$/, '');
                                window.location.href = `${apiBase}/api/auth/google`;
                            }}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold text-foreground bg-transparent rounded-xl border border-input hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                <path fill="none" d="M1 1h22v22H1z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Register Hostel? <a href="https://messprouet.vercel.app/register" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline">Click here</a>
                </div>
            </div>
        </div>
    );
}