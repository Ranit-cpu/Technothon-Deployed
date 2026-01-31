import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

const ManualCouponVerification = () => {
  const navigate = useNavigate();
  const [couponId, setCouponId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!couponId.trim()) {
      toast.error("Please enter a coupon ID");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append("coupon_id", couponId.trim());

      const response = await api.post("http://localhost:8000/checkQR", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "food served") {
        toast.success("✅ Coupon verified! Food served successfully");
        setVerificationResult({
          success: true,
          message: "Coupon redeemed successfully",
          couponId: couponId.trim(),
          timestamp: new Date().toLocaleString(),
        });
        // Clear input after successful verification
        setTimeout(() => setCouponId(""), 2000);
      } else if (response.data.status === "used") {
        toast.error("❌ This coupon has already been used");
        setVerificationResult({
          success: false,
          message: "Coupon already used",
          couponId: couponId.trim(),
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMsg = error.response?.data?.detail || "Coupon not found or invalid";
      toast.error(`❌ ${errorMsg}`);
      setVerificationResult({
        success: false,
        message: errorMsg,
        couponId: couponId.trim(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setCouponId("");
    setVerificationResult(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bg2.png')",
          filter: "blur(10px)",
          transform: "scale(1.05)",
        }}
      ></div>

      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-16">
        {/* Header Card */}
        <div className="backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-6 shadow-md mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 text-purple-300 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-purple-300 mb-2 flex items-center gap-3">
            <span>🎟️</span> Manual Coupon Verification
          </h1>
          <p className="text-gray-400 text-sm">
            Enter coupon ID manually when QR scanning is unavailable
          </p>
        </div>

        {/* Main Verification Card */}
        <div className="backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-8 shadow-md">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Input Field */}
            <div>
              <label
                htmlFor="couponId"
                className="block text-sm font-medium text-purple-300 mb-2"
              >
                Coupon ID
              </label>
              <input
                id="couponId"
                type="text"
                value={couponId}
                onChange={(e) => setCouponId(e.target.value)}
                placeholder="Enter coupon ID (e.g., COUP-ABC123)"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-white/10 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200 text-lg font-mono"
                disabled={isVerifying}
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: Coupon ID format should match your system's format
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isVerifying || !couponId.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 disabled:transform-none transition-all duration-200"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Coupon"
                )}
              </button>

              {(couponId || verificationResult) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`mt-8 p-6 rounded-xl border-2 ${
                verificationResult.success
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-red-900/20 border-red-500/30"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 text-lg ${
                  verificationResult.success ? "text-green-400" : "text-red-400"
                }`}
              >
                <span>{verificationResult.success ? "✅" : "❌"}</span>
                {verificationResult.success ? "Verification Successful" : "Verification Failed"}
              </h3>

              <div className="space-y-3 text-sm">
                <div
                  className={`flex justify-between items-center p-3 rounded ${
                    verificationResult.success ? "bg-green-900/20" : "bg-red-900/20"
                  }`}
                >
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-semibold ${
                      verificationResult.success ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {verificationResult.message}
                  </span>
                </div>

                <div
                  className={`flex justify-between items-center p-3 rounded ${
                    verificationResult.success ? "bg-green-900/20" : "bg-red-900/20"
                  }`}
                >
                  <span className="text-gray-400">Coupon ID:</span>
                  <span
                    className={`font-mono ${
                      verificationResult.success ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {verificationResult.couponId}
                  </span>
                </div>

                {verificationResult.timestamp && (
                  <p className="text-gray-500 text-xs text-right mt-2">
                    🕐 {verificationResult.timestamp}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!verificationResult && (
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <span>ℹ️</span> How to use:
              </h4>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Ask the participant for their coupon ID</li>
                <li>Enter the exact coupon ID in the field above</li>
                <li>Click "Verify Coupon" to check and redeem</li>
                <li>The system will mark it as used if valid</li>
              </ul>
            </div>
          )}
        </div>

        {/* Quick Stats Card (Optional) */}
        <div className="backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-6 shadow-md mt-8">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-purple-300">Check Carefully</p>
                <p className="text-gray-400 text-xs">
                  Verify the ID matches participant's details
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-medium text-purple-300">Fast Processing</p>
                <p className="text-gray-400 text-xs">
                  Instant verification and redemption
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-medium text-purple-300">Secure</p>
                <p className="text-gray-400 text-xs">
                  Prevents duplicate redemptions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-purple-300">Backup Method</p>
                <p className="text-gray-400 text-xs">
                  Use when QR scanning fails
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCouponVerification;