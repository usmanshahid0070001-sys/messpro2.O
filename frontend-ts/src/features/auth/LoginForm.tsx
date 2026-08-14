import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/AuthSlice';
import { useLoginMutation } from '../../hooks/mutations/useAuthMutations';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
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
            const response = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            dispatch(setCredentials({ user: response.user, token: response.token }));
            toast.success('Successfully logged in');
            navigate('/app');
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                placeholder="you@company.com"
                                aria-invalid={errors.email ? 'true' : 'false'}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                                className={`block w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 ${errors.email
                                        ? 'border-destructive focus:ring-destructive'
                                        : 'border-input focus:ring-ring'
                                    }`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <p id="email-error" role="alert" className="text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <a
                                    href="/forgot-password"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                    className={`block w-full px-3 py-2 pr-10 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 ${errors.password
                                            ? 'border-destructive focus:ring-destructive'
                                            : 'border-input focus:ring-ring'
                                        }`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p id="password-error" role="alert" className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {loginMutation.isError && (
                            <div
                                role="alert"
                                className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md"
                            >
                                {getErrorMessage(loginMutation.error)}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={busy}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                {busy ? 'Signing in…' : 'Sign in'}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/auth/google`)}
                                className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-medium text-foreground bg-background rounded-md border border-input shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    <path fill="none" d="M1 1h22v22H1z" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}