"use client";

import Link from "next/link";

import { useState } from "react";
import SkillsSelect from "../../components/volunteers/SkillsSelect";

export default function VolunteerRegister() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !phoneNumber || skills.length === 0) {
      setError("Please fill all fields and select at least one skill.");
      return;
    }
    setLoading(true);
    // Register user and volunteer
    const formattedPhone = phoneNumber.trim().startsWith("+91") ? phoneNumber.trim() : "+91" + phoneNumber.trim();
    const res = await fetch("/api/volunteer/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: formattedPhone, name, skills }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      // Send OTP
      const otpRes = await fetch("/api/volunteer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });
      const otpData = await otpRes.json();
      if (otpData.success) {
        setOtpSent(true);
        setSuccess("OTP sent! Please enter the OTP to complete registration.");
      } else {
        setError(otpData.error || "Failed to send OTP.");
      }
    } else {
      setError(data.error || "Registration failed.");
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    const formattedPhone = phoneNumber.trim().startsWith("+91") ? phoneNumber.trim() : "+91" + phoneNumber.trim();
    const res = await fetch("/api/volunteer/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: formattedPhone, otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      localStorage.setItem("phoneNumber", formattedPhone);
      window.location.href = "/volunteer";
    } else {
      setError(data.error || "Invalid OTP.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Volunteer Registration</h2>
        {!otpSent ? (
          <form onSubmit={handleSubmit}>
            <label className="block mb-2 font-semibold">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Enter your name" />

            <label className="block mb-2 font-semibold">Phone Number</label>
            <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Enter your phone number" />

            <label className="block mb-2 font-semibold">Select Your Skills</label>
            <SkillsSelect value={skills} onChange={setSkills} />

            <button type="submit" className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">{loading ? "Registering..." : "Register"}</button>
          </form>
        ) : (
          <div>
            <label className="block mb-2 font-semibold">Enter OTP</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Enter OTP received via SMS" />
            <button onClick={handleVerifyOtp} className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">{loading ? "Verifying..." : "Verify OTP & Complete Registration"}</button>
          </div>
        )}
        {error && <div className="mt-4 text-red-600 text-sm font-semibold">{error}</div>}
        {success && <div className="mt-4 text-green-600 text-sm font-semibold">{success}</div>}
      </div>
      <Link href="/portal" className="mt-6 text-green-700 hover:underline text-sm">Back to Portal Selection</Link>
    </div>
  );
}
