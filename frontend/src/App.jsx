import { useState, useCallback, useEffect } from "react";
import LoginStep from "./components/LoginStep";
import OTPStep from "./components/OTPStep";
import SuccessStep from "./components/SuccessStep";
import MailSetup from "./components/MailSetup";
import { getMailStatus } from "./api";
import "./index.css";

export default function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpData, setOtpData] = useState({ previewUrl: null, demoOtp: null });
  const [userData, setUserData] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [mailConfigured, setMailConfigured] = useState(false);

  useEffect(() => {
    getMailStatus()
      .then((d) => setMailConfigured(d.configured))
      .catch(() => { });
  }, []);

  const handleLoginSuccess = useCallback((userEmail, data) => {
    setEmail(userEmail);
    setOtpData({ previewUrl: data.previewUrl, demoOtp: data.demoOtp });
    setStep(2);
  }, []);

  const handleOTPSuccess = useCallback((data) => {
    setUserData(data);
    setStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setEmail("");
    setOtpData({ previewUrl: null, demoOtp: null });
    setUserData(null);
  }, []);

  const handleMailSaved = useCallback(() => {
    setMailConfigured(true);
    setShowSetup(false);
  }, []);

  return (
    <>
      <div className="bg-grid" />
      <div className="app-wrapper">
        <div className="card">
          {/* Gear icon to open Gmail setup */}
          {step === 1 && (
            <button
              className="setup-btn"
              onClick={() => setShowSetup(true)}
              title="Configure Gmail for real email delivery"
            >
              {mailConfigured ? "📧 Gmail ✓" : "⚙️ Setup Email"}
            </button>
          )}

          {showSetup && (
            <MailSetup
              onSaved={handleMailSaved}
              onClose={() => setShowSetup(false)}
            />
          )}

          {!showSetup && step === 1 && (
            <LoginStep onSuccess={handleLoginSuccess} mailConfigured={mailConfigured} />
          )}
          {!showSetup && step === 2 && (
            <OTPStep
              email={email}
              otpData={otpData}
              setOtpData={setOtpData}
              onSuccess={handleOTPSuccess}
              onBack={handleReset}
            />
          )}
          {!showSetup && step === 3 && (
            <SuccessStep userData={userData} onReset={handleReset} />
          )}
        </div>
      </div>
    </>
  );
}
