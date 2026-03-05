export default function SuccessStep({ userData, onReset }) {
    const now = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return (
        <div className="success-screen step-enter">
            <div className="step-indicator">
                <div className="step-dot done" />
                <div className="step-dot done" />
                <div className="step-dot done" />
            </div>

            <div className="success-icon">✅</div>

            <h1>Authentication Granted!</h1>
            <p className="subtitle">
                You have been successfully verified.<br />
                Welcome back, <strong style={{ color: "#a78bfa" }}>{userData?.name || "User"}</strong>!
            </p>

            <div className="email-chip">
                <span>📧</span>
                {userData?.email}
            </div>

            <div className="success-meta">
                <p>🕒 Logged in at <strong>{now}</strong></p>
                <p>🔐 Multi-factor authentication <strong>passed</strong></p>
                <p>✅ Identity <strong>verified via OTP</strong></p>
            </div>

            <div className="alert alert-success">
                <span>🎉</span>
                <div>
                    <strong>Access granted.</strong> Your account is protected by 2-step verification.
                </div>
            </div>

            <button className="btn-primary" onClick={onReset} style={{ marginTop: "8px" }}>
                🔒 Sign Out & Reset
            </button>

            <p className="tagline">🔒 Protected by Multi-Factor Authentication</p>
        </div>
    );
}
