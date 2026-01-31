import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Home from "./pages/Home";
import BackgroundGradient from "./components/design/BackgroundGradient";

// ✅ Lazy load pages 
const CoreTeam = lazy(() => import("./pages/CoreTeam"));
const TeamApply = lazy(() => import("./pages/DevTeamApply"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const Contact = lazy(() => import("./pages/Contact"));
const TeamRegistration = lazy(() => import("./pages/TeamRegistration"));
const CurrentTeam = lazy(() => import("./pages/CurrentTeam"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const AboutUs = lazy(() => import("./pages/About"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Edit = lazy(() => import("./pages/Edit"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AIUnleashed = lazy(() => import("./pages/AIUnleashed"));
const IOTExposition = lazy(() => import("./pages/IOTExposition"));
const Loader = lazy(() => import("./components/Loader"));
const ManualCouponVerification = lazy(() => import("./pages/ManualCouponVerification"));

// ✅ Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen">
        <Routes>
          {/* 🏠 Home gets its OWN Suspense (no global loader fallback) */}
          <Route
            path="/"
            element={
              <Suspense fallback={null}>
                <Home />
              </Suspense>
            }
          />

          {/* ✅ All other routes share the global loader */}
          <Route
            path="*"
            element={
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* ✅ FIXED APPLY ROUTES */}
                  <Route path="/apply/development" element={<TeamApply />} />
                  <Route path="/apply/core" element={<CoreTeam />} />

                  <Route path="/signup" element={<RegisterPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route
                    path="/team-registration"
                    element={<TeamRegistration />}
                  />
                  <Route path="/curteam" element={<CurrentTeam />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/careers" element={<CareersPage />} />

                  {/* Dashboards */}
                  <Route path="/user" element={<UserDashboard />} />
                  <Route path="/edit" element={<Edit />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route
                    path="/manual-verify"
                    element={<ManualCouponVerification />}
                  />

                  {/* Events */}
                  <Route
                    path="/events/ai-unleashed"
                    element={<AIUnleashed />}
                  />
                  <Route
                    path="/events/iot-exposition"
                    element={<IOTExposition />}
                  />

                  {/* 404 fallback */}
                  <Route
                    path="*"
                    element={
                      <div className="relative min-h-screen flex items-center justify-center bg-black/80">
                        <BackgroundGradient />
                        <div className="relative z-10 text-4xl font-bold text-red-400 p-6 rounded-lg">
                          404 | Page Not Found
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
