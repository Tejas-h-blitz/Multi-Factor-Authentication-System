const API = "http://localhost:5000/api";

export async function sendOTP(email, password) {
    const res = await fetch(`${API}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function verifyOTP(email, otp) {
    const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    return res.json();
}

export async function resendOTP(email) {
    const res = await fetch(`${API}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return res.json();
}

export async function getMailStatus() {
    const res = await fetch(`${API}/mail-status`);
    return res.json();
}

export async function setupMail(user, pass) {
    const res = await fetch(`${API}/setup-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
    });
    return res.json();
}
