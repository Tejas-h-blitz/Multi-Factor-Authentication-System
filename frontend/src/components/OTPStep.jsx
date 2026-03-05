import { useState, useEffect, useRef } from "react";
import { verifyOTP, resendOTP } from "../api";

const OTP_EXPIRE_SECS = 300;

export default function OTPStep({ email, otpData, setOtpData, onSuccess, onBack }) {
    const { previewUrl, demoOtp } = otpData;
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [timeLeft, setTimeLeft] = useState(OTP_EXPIRE_SECS);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");
        if (otp.length !== 6) { setError("OTP must be 6 digits."); return; }
        if (timeLeft === 0) { setError("OTP expired. Please resend."); return; }
        setLoading(true);
        try {
            const data = await verifyOTP(email, otp);
            if (data.success) onSuccess(data.user);
            else setError(data.message || "Incorrect OTP.");
        } catch {
            setError("Cannot reach server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError(""); setInfo(""); setResending(true);
        try {
            const data = await resendOTP(email);
            if (data.success) {
                setInfo("New OTP sent!");
                setOtpData({ previewUrl: data.previewUrl, demoOtp: data.demoOtp });
                setTimeLeft(OTP_EXPIRE_SECS);
                setOtp("");
            } else {
                setError(data.message || "Failed to resend.");
            }
        } catch {
            setError("Cannot reach server.");
        } finally {
            setResending(false);
        }
    };

    const handleOTPChange = (e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));

    // Auto-fill when user clicks the demo OTP
    const handleDemoClick = () => {
        if (demoOtp) setOtp(demoOtp);
    };

    return (
        <div className="step-enter">
            <div className="shield-icon">📨</div>
            <div className="step-indicator">
                <div className="step-dot done" />
                <div className="step-dot active" />
                <div className="step-dot" />
            </div>

            <button className="back-link" onClick={onBack}>← Back to Login</button>

            <h1>Verify Your Identity</h1>
            <p className="subtitle">
                OTP sent to <strong>{email}</strong>. Enter it below within 5 minutes.
            </p>

            {/* ── Demo Mode banner: shows OTP directly on screen ── */}
            {demoOtp && (
                <div className="demo-otp-banner" onClick={handleDemoClick} title="Click to auto-fill">
                    <div className="demo-otp-label">📬 Demo Mode — Your OTP <span style={{ fontSize: "11px", opacity: 0.7 }}>(click to fill)</span></div>
                    <div className="demo-otp-code">{demoOtp}</div>
                    {previewUrl && (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="demo-preview-link"
                            onClick={(e) => e.stopPropagation()}>
                            View email ↗
                        </a>
                    )}
                </div>
            )}

            {/* ── Real email mode: just a confirmation ── */}
            {!demoOtp && (
                <div className="alert alert-success" style={{ marginBottom: "12px" }}>
                    <span>📧</span> OTP sent to your inbox! Check your email.
                </div>
            )}

            {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
            {info && <div className="alert alert-success"><span>✅</span> {info}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="otp">One-Time Password</label>
                    <div className="input-wrap">
                        <span className="input-icon">🔢</span>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={6}
                            className="otp-input"
                            placeholder="——————"
                            value={otp}
                            onChange={handleOTPChange}
                            autoComplete="one-time-code"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="timer-wrap">
                    <span>OTP expires in</span>
                    <span className={`timer-badge ${timeLeft === 0 ? "expired" : ""}`}>
                        {timeLeft === 0 ? "Expired" : formatTime(timeLeft)}
                    </span>
                </div>

                <button type="submit" className="btn-primary"
                    disabled={loading || otp.length !== 6} style={{ marginTop: "16px" }}>
                    {loading ? <><span className="spinner" />Verifying…</> : "Verify OTP ✓"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
                Didn't receive it?{" "}
                <button className="btn-ghost" onClick={handleResend} disabled={resending}>
                    {resending ? "Sending…" : "Resend OTP"}
                </button>
            </div>

            <p className="tagline">🔒 Protected by Multi-Factor Authentication</p>
        </div>
    );
}
