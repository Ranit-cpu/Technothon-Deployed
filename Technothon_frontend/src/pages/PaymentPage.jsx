import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { CheckCircle, X } from "lucide-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamSize, setTeamSize] = useState(5); // Default to 5 members
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    merchantName: "",
    paymentType: "UPI Address",
    upiId: "",
    amount: "",
    description: "",
    paymentMode: "",
    transactionId: "",
    userId: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true,
        });
        setFormData((prev) => ({
          ...prev,
          userId: res.data.id || res.data.uid,
        }));
      } catch (err) {
        console.error("Failed to fetch user session:", err);
        alert("Please login to submit payment.");
        navigate("/login");
      }
    };
    fetchUser();

    // Get team size from localStorage or sessionStorage
    const storedTeamSize = localStorage.getItem("teamSize") || sessionStorage.getItem("teamSize");

    console.log("🔍 Checking team size:");
    console.log("  - localStorage:", localStorage.getItem("teamSize"));
    console.log("  - sessionStorage:", sessionStorage.getItem("teamSize"));
    console.log("  - Final value:", storedTeamSize);

    if (storedTeamSize) {
      const parsedSize = parseInt(storedTeamSize);
      console.log("  - Parsed size:", parsedSize);
      setTeamSize(parsedSize);

      // Set static amount based on team size
      const amount = parsedSize === 6 ? "1200" : "1000";
      setFormData((prev) => ({
        ...prev,
        amount: amount,
      }));
    } else {
      console.log("  - No team size found, using default: 5");
      // Set default amount for 5 members
      setFormData((prev) => ({
        ...prev,
        amount: "1000",
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.transactionId || !formData.upiId || !formData.paymentMode) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        transaction_id: formData.transactionId,
        bank_name: formData.paymentMode,
        upi_id: formData.upiId,
      };

      const response = await axios.post(
        "http://localhost:8000/api/payment/submit",
        payload,
        {
          withCredentials: true,
        }
      );

      // Show custom success modal
      setShowSuccessModal(true);

      // Navigate after 2 seconds
      setTimeout(() => {
        navigate("/user");
      }, 2000);

    } catch (err) {
      console.error("Payment error:", err);

      // Better error handling with specific messages
      if (err.response) {
        const errorMsg = err.response.data?.detail || "Error saving payment details";
        alert(errorMsg);

        // Log more details for debugging
        console.error("Error details:", {
          status: err.response.status,
          data: err.response.data,
        });
      } else if (err.request) {
        alert("No response from server. Please check your connection.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine which QR code to display based on team size
  const getQRCodePath = () => {
    // Only allow 5 or 6 member teams
    if (teamSize === 6) {
      return "/images/6.png";
    }
    return "/images/5.png"; // Default to 5 members
  };

  return (
    <div
      className="min-h-screen px-6 py-12 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/bg2.png')",
        backgroundColor: "#0f0b1f",
      }}
    >
      <Navbar />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/user");
              }}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success Icon */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full"></div>
                <CheckCircle className="w-20 h-20 text-green-400 animate-bounce-in relative z-10" />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white">
                Payment Successful! 🎉
              </h2>

              {/* Message */}
              <p className="text-purple-200 text-lg">
                Your payment information has been saved successfully.
              </p>

              {/* Redirect info */}
              <p className="text-sm text-purple-300">
                Redirecting to your dashboard...
              </p>

              {/* Animated progress bar */}
              <div className="w-full bg-purple-900/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section */}
      <div className="pt-32 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Form Section */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Submit Payment Info
            </h2>

            <div>
              <label className="text-sm text-purple-300">Payee Name</label>
              <input
                type="text"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleChange}
                className="w-full bg-purple-950/50 border border-purple-800 p-2 rounded-xl text-white placeholder-purple-400"
                placeholder="Enter payee name"
              />
            </div>

            <div>
              <label className="text-sm text-purple-300">
                UPI ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full bg-purple-950/50 border border-purple-800 p-2 rounded-xl text-white"
                placeholder="yourname@upi"
                required
              />
            </div>

            <div>
              <label className="text-sm text-purple-300">
                Transaction Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-purple-950/50 border border-purple-800 p-2 rounded-xl text-white bg-opacity-50 cursor-not-allowed"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                readOnly
                disabled
              />
              <p className="text-xs text-purple-400 mt-1">
                Amount is set based on team size ({teamSize} members)
              </p>
            </div>

            <div>
              <label className="text-sm text-purple-300">
                Payment App <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full bg-purple-950/50 border border-purple-800 p-2 rounded-xl text-white"
                placeholder="e.g., PhonePe, Google Pay, Paytm"
                required
              />
            </div>

            <div>
              <label className="text-sm text-purple-300">
                Transaction ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full bg-purple-950/50 border border-purple-800 p-2 rounded-xl text-white"
                placeholder="Enter transaction ID"
                required
              />
              <p className="text-xs text-purple-400 mt-1">
                You'll find this in your payment app after completing the transaction
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-xl font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Payment Info"}
            </button>
          </form>

          {/* Right QR Display Section */}
          <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Scan QR to Pay
            </h2>
            <div className="mb-2 text-sm text-purple-300">
              Team Size: {teamSize} members
            </div>
            <img
              src={getQRCodePath()}
              alt={`QR Code for ${teamSize} members`}
              className="w-60 h-60 rounded-lg border border-purple-700 mb-4"
              onError={(e) => {
                console.error("QR code failed to load");
                e.target.src = "/images/QR.png"; // Fallback to default QR
              }}
            />
            <div className="w-full text-sm text-purple-200 space-y-2 mt-4">
              <div className="flex justify-between">
                <span>Payment For</span>
                <span>Custom UPI</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-purple-700 pt-2">
                <span>Total</span>
                <span>₹{formData.amount || "0.00"}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-purple-300 text-center">
              <p>1. Scan the QR code with any UPI app</p>
              <p>2. Complete the payment</p>
              <p>3. Fill in the transaction details on the left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-progress {
          animation: progress 2s ease-out;
        }
      `}</style>
    </div>
  );
}