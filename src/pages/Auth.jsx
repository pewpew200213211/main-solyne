import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ─── constants ────────────────────────────────────────────────
const REDIRECT_URL = `${window.location.origin}/auth/callback`;

// ─── tiny helpers ─────────────────────────────────────────────
const Input = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</label>
        <input
            {...props}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-primary/70 transition-colors duration-200"
        />
    </div>
);

const Btn = ({ children, loading = false, variant = 'primary', ...props }) => {
    const base = "w-full py-3.5 rounded-lg text-xs uppercase tracking-[0.15em] font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50";
    const styles = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        secondary: "bg-foreground text-background hover:opacity-90 active:scale-[0.98]",
        ghost: "border border-border text-foreground/70 hover:border-border/80 hover:text-foreground",
    };
    return (
        <button type={props.type || 'button'} disabled={loading} className={`${base} ${styles[variant]}`} {...props}>
            {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
        </button>
    );
};

const Divider = ({ label }) => (
    <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex-1 h-px bg-border" />
    </div>
);

// ─── Google Icon ───────────────────────────────────────────────
const GoogleIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// ═══════════════════════════════════════════════════════════════
export default function Auth() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('login');   // login | register | forgot | phone
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);       // { type: 'success'|'error', text }

    // email/password fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // phone OTP fields
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // If already signed in, go straight to shop
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/shop', { replace: true });
        });
    }, [navigate]);

    // Listen for OAuth callback (Google) — fires when Supabase resolves the token
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN') && session) {
                navigate('/shop', { replace: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [navigate]);

    const setError = (text) => setMsg({ type: 'error', text });
    const setSuccess = (text) => setMsg({ type: 'success', text });
    const clearMsg = () => setMsg(null);

    // ── Google OAuth ──────────────────────────────────────────
    const handleGoogle = async () => {
        clearMsg();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: REDIRECT_URL },
        });
        if (error) { setError(error.message); setLoading(false); }
        // on success browser navigates away, so we don't stop loading
    };

    // ── Email Login ───────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault(); clearMsg(); setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setError(error.message);
        // onAuthStateChange will redirect on success
    };

    // ── Email Register ────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault(); clearMsg();
        if (password !== confirmPw) return setError('Passwords do not match.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) setError(error.message);
        else setSuccess('Account created! Check your email to confirm, then sign in.');
    };

    // ── Forgot Password ───────────────────────────────────────
    const handleForgot = async (e) => {
        e.preventDefault(); clearMsg(); setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth`,
        });
        setLoading(false);
        if (error) setError(error.message);
        else setSuccess('Password reset email sent! Check your inbox.');
    };

    // ── Phone OTP ─────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault(); clearMsg(); setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ phone });
        setLoading(false);
        if (error) setError(error.message);
        else { setOtpSent(true); setSuccess('OTP sent! Check your messages.'); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault(); clearMsg(); setLoading(true);
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
        setLoading(false);
        if (error) setError(error.message);
        // onAuthStateChange handles redirect
    };

    // ── Tabs ──────────────────────────────────────────────────
    const tabs = [
        { id: 'login', label: 'Sign In' },
        { id: 'register', label: 'Register' },
        { id: 'phone', label: 'Phone' },
    ];

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-10">
                    <h1 className="font-serif text-3xl text-foreground font-light tracking-widest uppercase mb-2">
                        SOL<span className="text-primary">Y</span>NÉ
                    </h1>
                    <p className="text-muted-foreground text-xs tracking-wider">
                        {tab === 'login' ? 'Welcome back' : tab === 'register' ? 'Create your account' : tab === 'phone' ? 'Sign in with phone' : 'Reset your password'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">

                    {/* Google */}
                    {tab !== 'forgot' && (
                        <>
                            <Btn variant="secondary" loading={loading} onClick={handleGoogle}>
                                <GoogleIcon /> Continue with Google
                            </Btn>
                            <Divider label="or" />
                        </>
                    )}

                    {/* Tab switcher */}
                    {tab !== 'forgot' && (
                        <div className="flex bg-background rounded-lg p-1 mb-6 gap-1 border border-border/50">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => { setTab(t.id); clearMsg(); }}
                                    className={`flex-1 py-2 rounded-md text-[10px] uppercase tracking-widest transition-all duration-200
                                        ${tab === t.id ? 'bg-shadow-layer text-primary' : 'text-muted-foreground hover:text-foreground/70'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Status message */}
                    <AnimatePresence>
                        {msg && (
                            <motion.div
                                key={msg.text}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mb-5 px-4 py-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                            >
                                {msg.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── LOGIN FORM ── */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Password</label>
                                    <button type="button" onClick={() => { setTab('forgot'); clearMsg(); }} className="text-[10px] text-primary hover:underline tracking-wider uppercase">Forgot?</button>
                                </div>
                                <input
                                    type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/70 transition-colors"
                                />
                            </div>
                            <div className="pt-2">
                                <Btn type="submit" variant="primary" loading={loading}>Sign In</Btn>
                            </div>
                        </form>
                    )}

                    {/* ── REGISTER FORM ── */}
                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                            <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                            <Input label="Confirm Password" type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                            <div className="pt-2">
                                <Btn type="submit" variant="primary" loading={loading}>Create Account</Btn>
                            </div>
                        </form>
                    )}

                    {/* ── PHONE OTP ── */}
                    {tab === 'phone' && (
                        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                            <Input
                                label="Phone Number (E.164 format, e.g. +8801XXXXXXXXX)"
                                type="tel" required value={phone}
                                disabled={otpSent}
                                onChange={e => setPhone(e.target.value)}
                            />
                            {otpSent && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <Input label="Verification Code" type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
                                </motion.div>
                            )}
                            <div className="pt-2 space-y-2">
                                <Btn type="submit" variant="primary" loading={loading}>
                                    {otpSent ? 'Verify & Sign In' : 'Send Code'}
                                </Btn>
                                {otpSent && (
                                    <Btn type="button" variant="ghost" onClick={() => { setOtpSent(false); setOtp(''); clearMsg(); }}>
                                        Change Number
                                    </Btn>
                                )}
                            </div>
                        </form>
                    )}

                    {/* ── FORGOT PASSWORD ── */}
                    {tab === 'forgot' && (
                        <form onSubmit={handleForgot} className="space-y-4">
                            <p className="text-muted-foreground text-sm mb-4">Enter your email and we'll send you a reset link.</p>
                            <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                            <div className="pt-2 space-y-2">
                                <Btn type="submit" variant="primary" loading={loading}>Send Reset Link</Btn>
                                <Btn type="button" variant="ghost" onClick={() => { setTab('login'); clearMsg(); }}>← Back to Sign In</Btn>
                            </div>
                        </form>
                    )}

                </div>

                {/* Footer toggle */}
                <p className="text-center text-muted-foreground text-xs mt-6 tracking-wide">
                    {tab === 'login' ? (
                        <>No account? <button type="button" onClick={() => { setTab('register'); clearMsg(); }} className="text-primary hover:underline">Register</button></>
                    ) : tab !== 'forgot' ? (
                        <>Have an account? <button type="button" onClick={() => { setTab('login'); clearMsg(); }} className="text-primary hover:underline">Sign In</button></>
                    ) : null}
                </p>

            </div>
        </div>
    );
}
