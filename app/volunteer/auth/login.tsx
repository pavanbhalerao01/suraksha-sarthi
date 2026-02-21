"use client";

import { useState } from "react";
import Link from "next/link";

export default function VolunteerLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
      setLoading(true);
      setError("");
      let formattedPhone = phoneNumber.trim();
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = "+91" + formattedPhone;
      }
      // Check if user exists
      const checkRes = await fetch("/api/volunteer/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });
      const checkData = await checkRes.json();
      if (!checkData.exists) {
        setLoading(false);
        window.location.href = `/volunteer/auth/register?phone=${encodeURIComponent(formattedPhone)}`;
        return;
      }
      // Proceed to send OTP
      const res = await fetch("/api/volunteer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send OTP");
      }
  };

  const handleVerifyOtp = async () => {
      setLoading(true);
      setError("");
      let formattedPhone = phoneNumber.trim();
      // Auto-format for Indian numbers
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = "+91" + formattedPhone;
      }
      const res = await fetch("/api/volunteer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone, otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        // Redirect to volunteer dashboard
        window.location.href = "/volunteer";
      } else {
        setError(data.error || "Invalid OTP");
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Volunteer Login / Register</h2>
        {!otpSent ? (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your phone number"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mb-2"
              disabled={loading || !phoneNumber}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter OTP received via SMS"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mb-2"
              disabled={loading || !otp}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={() => setOtpSent(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back
            </button>
          </>
        )}
        {error && <div className="mt-4 text-red-600 text-sm font-semibold">{error}</div>}
        <div className="mt-6 text-xs text-gray-500 text-center">
          By registering, you agree to volunteer safety guidelines and data privacy policy.
        </div>
      </div>
      <Link href="/portal" className="mt-6 text-green-700 hover:underline text-sm">Back to Portal Selection</Link>
    </div>
  );
}
