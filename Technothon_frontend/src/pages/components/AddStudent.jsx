import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const AddStudent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    contact: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agree) {
      alert("Please accept Terms & Conditions");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/admin/add_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`, // if needed
        },
        body: JSON.stringify({
          student_id: form.studentId,
          name: form.name,
          email: form.email,
          contact: form.contact,
          whatsapp: form.whatsapp,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add student");
      }

      alert("Student added successfully ✅");

      // Reset form
      setForm({
        studentId: "",
        name: "",
        email: "",
        contact: "",
        whatsapp: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-3xl bg-[#120b1f]/90 backdrop-blur-xl p-8 shadow-2xl border border-purple-500/20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeft className="text-white/70 cursor-pointer" />
          <h1 className="text-3xl font-bold text-purple-300">
            Create an Account
          </h1>
        </div>

        <p className="text-white/60 mb-6">
          Admin panel – add new student
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="studentId"
            placeholder="Student ID"
            className="input"
            value={form.studentId}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Full Name"
            className="input"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="contact"
              placeholder="Contact No"
              className="input"
              value={form.contact}
              onChange={handleChange}
              required
            />
            <input
              name="whatsapp"
              placeholder="WhatsApp No"
              className="input"
              value={form.whatsapp}
              onChange={handleChange}
              required
            />
          </div>

          <p className="text-xs text-white/50">
            (If same as contact, fill same number in both)
          </p>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="input"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="input"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms */}
          <label className="flex items-center gap-3 text-white/70 text-sm">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="accent-purple-600"
            />
            I agree to the Terms & Conditions
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500
              text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

        </form>
      </div>

      {/* Tailwind input style */}
      <style>{`
        .input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(88, 28, 135, 0.25);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: white;
          outline: none;
        }
        .input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .input:focus {
          border-color: rgb(168, 85, 247);
          box-shadow: 0 0 0 2px rgba(168,85,247,0.3);
        }
      `}</style>
    </div>
  );
};

export default AddStudent;
