import { useState } from "react";
import { setupMail } from "../api";

export default function MailSetup({ onSaved, onClose }) {
    const [gmailUser, setGmailUser] = useState("");
    const [gmailPass, setGmailPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        if (!gmailUser || !gmailPass) { setError("Both fields are required."); return; }
        setLoading(true);
        try {
            const data = await setupMail(gmailUser, gmailPass);
            if (data.success) {
                setSuccess("Gmail configured! Real OTPs will now be sent.");
                setTimeout(onSaved, 1500);
            } else {
                setError(data.message || "Failed to save.");
            }
        } catch {
            setError("Cannot reach server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="step-enter">
            <div className="shield-icon" style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}>⚙️</div>
            <h1>Email Setup</h1>
            <p className="subtitle">
                Enter your <strong>Gmail</strong> credentials to send real OTPs to any inbox.
                Credentials are saved to <code style={{ color: "var(--purple-light)" }}>mail.config.json</code> on your server.
            </p>

            <div className="alert alert-info" style={{ fontSize: "12px", flexDirection: "column", gap: "4px" }}>
                <div>💡 Use a <strong>Gmail App Password</strong>, not your regular password.</div>
                <a href="https://myaccount.google.com/apppasswords"
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: "#c4b5fd", fontSize: "12px" }}>
                    Create App Password ↗
                </a>
            </div>

            {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
            {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="guser">Gmail Address</label>
                    <div className="input-wrap">
                        <span className="input-icon">📧</span>
                        <input id="guser" type="email" placeholder="you@gmail.com"
                            value={gmailUser} onChange={(e) => setGmailUser(e.target.value)} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="gpass">Gmail App Password</label>
                    <div className="input-wrap">
                        <span className="input-icon">🔑</span>
                        <input id="gpass" type={showPass ? "text" : "password"}
                            placeholder="xxxx xxxx xxxx xxxx"
                            value={gmailPass} onChange={(e) => setGmailPass(e.target.value)} required />
                        <button type="button" className="eye-toggle" onClick={() => setShowPass(v => !v)}>
                            {showPass ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner" />Saving…</> : "Save & Enable Real Email"}
                </button>
            </form>

            <button className="btn-ghost" style={{ display: "block", margin: "14px auto 0", fontSize: "13px" }}
                onClick={onClose}>
                ← Skip (use Demo Mode)
            </button>
        </div>
    );
}
