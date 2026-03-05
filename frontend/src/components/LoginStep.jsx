import { useState } from "react";
import { sendOTP } from "../api";

export default function LoginStep({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        try {
            const data = await sendOTP(email, password);
            if (data.success) {
                onSuccess(email, data.previewUrl);
            } else {
                setError(data.message || "Failed to send OTP.");
            }
        } catch {
            setError("Cannot reach server. Is the backend running on port 5000?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="step-enter">
            <div className="shield-icon">🔐</div>

            <div className="step-indicator">
                <div className="step-dot active" />
                <div className="step-dot" />
                <div className="step-dot" />
            </div>

            <h1>Secure Sign In</h1>
            <p className="subtitle">
                Enter your email and password — we'll send a one-time OTP to verify your identity.
            </p>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrap">
                        <span className="input-icon">✉️</span>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrap">
                        <span className="input-icon">🔑</span>
                        <input
                            id="password"
                            type={showPw ? "text" : "password"}
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            minLength={6}
                            required
                        />
                        <button
                            type="button"
                            className="eye-toggle"
                            onClick={() => setShowPw((v) => !v)}
                            aria-label="Toggle password visibility"
                        >
                            {showPw ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner" />Sending OTP…</> : "Send OTP →"}
                </button>
            </form>

            <p className="tagline" style={{ marginTop: "20px" }}>🔒 Protected by Multi-Factor Authentication</p>
        </div>
    );
}
