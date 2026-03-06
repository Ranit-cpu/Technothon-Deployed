import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, CheckCircle, UserPlus, X, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "react-router-dom";

export default function TeamRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamData, setTeamData] = useState({
    teamName: "",
    leaderRole: "",
    leadFood: "veg",
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [memberFood, setMemberFood] = useState("veg");

  // Modal states
  const [showMemberAddedModal, setShowMemberAddedModal] = useState(false);
  const [showTeamCreatedModal, setShowTeamCreatedModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [addedMemberName, setAddedMemberName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const availableRoles = [
  "Embedded Systems Engineer",
  "IoT Hardware Engineer",
  "IoT Firmware Developer",
  "Sensor & Actuator Specialist",
  "Robotics Engineer",
  "Edge Computing Engineer",
  "IoT Network & Protocol Engineer",
  "Cloud IoT Engineer",
  "Industrial IoT (IIoT) Engineer",
  "AIoT Engineer",
  "IoT Security Engineer",
  "Smart Systems Developer",
];

  // ---------------------------------------------------------
  // FETCH CURRENT AUTHENTICATED USER
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/api/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("User not logged in");

        const data = await res.json();
        setCurrentUser(data);

        setTeamMembers([
          {
            id: data.uid || data.id,
            name: data.name,
            role: "",
            status: "accepted",
            isLeader: true,
            foodPreference: "veg",
          },
        ]);
      } catch (err) {
        alert("❌ Please log in to continue.");
        window.location.href = "/login";
      }
    }
    fetchUser();
  }, []);

  const handleTeamRegistration = () => {
    const { teamName, leadFood, leaderRole } = teamData;

    if (!teamName || !leaderRole || !leadFood) {
      alert("Please fill all fields");
      return;
    }

    setTeamMembers((prev) =>
      prev.map((m) =>
        m.isLeader
          ? { ...m, role: leaderRole, foodPreference: leadFood }
          : m
      )
    );
    setCurrentStep(2);
  };

  // ---------------------------------------------------------
  // SEARCH MEMBER
  // ---------------------------------------------------------
  const handleSearchMember = async () => {
    if (!searchId.trim() || !selectedRole) {
      alert("Please enter member ID and select role");
      return;
    }

    if (teamMembers.length >= 6) {
      alert("Maximum 6 members allowed");
      return;
    }

    if (teamMembers.some((m) => m.role === selectedRole)) {
      alert("This role is already assigned");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/search-user?uid=${encodeURIComponent(searchId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.detail || "No user exists or User does not meet attendance criteria");
        setShowErrorModal(true);

        // Auto close after 2 seconds
        setTimeout(() => {
          setShowErrorModal(false);
        }, 2000);
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0 || !data[0]?.uid) {
        setErrorMessage("No user exists or User does not meet attendance criteria");
        setShowErrorModal(true);

        // Auto close after 2 seconds
        setTimeout(() => {
          setShowErrorModal(false);
        }, 2000);
        return;
      }

      const newMember = {
        id: data[0].uid,
        name: data[0].Name,
        role: selectedRole,
        status: "accepted",
        isLeader: false,
        foodPreference: memberFood,
      };

      setTeamMembers((prev) => [...prev, newMember]);
      setAddedMemberName(data[0].Name);
      setSearchId("");
      setSelectedRole("");
      setMemberFood("veg");

      // Show success modal
      setShowMemberAddedModal(true);

      // Auto close after 1 second
      setTimeout(() => {
        setShowMemberAddedModal(false);
      }, 1000);

    } catch (error) {
      setErrorMessage("No user exists or User does not meet attendance criteria");
      setShowErrorModal(true);

      // Auto close after 2 seconds
      setTimeout(() => {
        setShowErrorModal(false);
      }, 2000);
    }
  };

  const removeMember = (memberId) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const getAvailableRoles = () =>
    availableRoles.filter((r) => !teamMembers.some((m) => m.role === r));

  // ---------------------------------------------------------
  // FINALIZE TEAM
  // ---------------------------------------------------------
  const handleFinalizeTeam = async () => {
    if (teamMembers.length < 5) {
      alert("❌ Minimum 5 members required to finalize the team.");
      return;
    }

    if (teamMembers.some((m) => !m.role)) {
      alert("❌ Please assign roles to all team members.");
      return;
    }

    if (!eventId) {
      alert("❌ Event ID is missing. Please try registering from the event page.");
      return;
    }

    localStorage.setItem("teamSize", teamMembers.length.toString());
    console.log("✅ Team size stored in localStorage:", teamMembers.length);

    const payload = {
      team_name: teamData.teamName,
      event_id: eventId,
      existing_members: teamMembers.map((m) => ({
        uid: m.id,
        role: m.role,
        food_preference: m.foodPreference,
      })),
      created_by_id: teamMembers.find((m) => m.isLeader)?.id,
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch("http://localhost:8000/api/team/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert("❌ " + (err.detail || "Unknown error"));
        return;
      }

      const data = await response.json();

      // Show success modal
      setShowTeamCreatedModal(true);

      // Navigate after 1 second
      setTimeout(() => {
        window.location.href = "/payment";
      }, 1000);

    } catch (error) {
      alert("❌ " + (error.message || "Something went wrong"));
    }
  };

  const canProceed =
    teamMembers.length >= 5 && !teamMembers.some((m) => !m.role);

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <Navbar />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full"></div>
                <AlertCircle className="w-16 h-16 text-red-400 animate-bounce-in relative z-10" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                User Not Found
              </h2>

              <p className="text-red-200 text-lg">
                {errorMessage}
              </p>

              <div className="w-full bg-red-900/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-progress-2s"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Added Success Modal */}
      {showMemberAddedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowMemberAddedModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full"></div>
                <UserPlus className="w-16 h-16 text-green-400 animate-bounce-in relative z-10" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Member Added! 🎉
              </h2>

              <p className="text-purple-200 text-lg">
                {addedMemberName} has been added to your team
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Created Success Modal */}
      {showTeamCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
            <button
              onClick={() => {
                setShowTeamCreatedModal(false);
                window.location.href = "/payment";
              }}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full"></div>
                <CheckCircle className="w-20 h-20 text-green-400 animate-bounce-in relative z-10" />
              </div>

              <h2 className="text-3xl font-bold text-white">
                Team Registered! 🚀
              </h2>

              <p className="text-purple-200 text-lg">
                Your team "{teamData.teamName}" has been created successfully
              </p>

              <p className="text-sm text-purple-300">
                Redirecting to payment...
              </p>

              <div className="w-full bg-purple-900/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-progress-1s"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl w-full px-4 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-8 mx-auto">
        <div>
          {currentStep === 1 && (
            <div>
              <h1 className="text-4xl font-semibold mb-6 text-purple-400">
                Register Your Team
              </h1>

              <Card className="bg-[#15111e] backdrop-blur-md rounded-lg shadow-2xl border-none">
                <CardContent className="p-8 space-y-6">
                  <Input
                    value={teamData.teamName}
                    onChange={(e) =>
                      setTeamData((prev) => ({
                        ...prev,
                        teamName: e.target.value,
                      }))
                    }
                    placeholder="Team Name"
                    className="bg-white/10 border border-purple-600 placeholder-white/70 text-white"
                  />

                  <div className="space-y-2">
                    <label className="text-sm text-white">Food Preference</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="leadFood"
                          value="veg"
                          checked={teamData.leadFood === "veg"}
                          onChange={() =>
                            setTeamData((prev) => ({ ...prev, leadFood: "veg" }))
                          }
                          className="accent-white"
                        />
                        <span>Veg</span>
                      </label>
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="leadFood"
                          value="non-veg"
                          checked={teamData.leadFood === "non-veg"}
                          onChange={() =>
                            setTeamData((prev) => ({ ...prev, leadFood: "non-veg" }))
                          }
                          className="accent-white"
                        />
                        <span>Non-Veg</span>
                      </label>
                    </div>
                  </div>

                  <Select
                    value={teamData.leaderRole}
                    onValueChange={(v) =>
                      setTeamData((prev) => ({ ...prev, leaderRole: v }))
                    }
                  >
                    {({ isOpen, setIsOpen, value, onValueChange }) => (
                      <>
                        <SelectTrigger
                          isOpen={isOpen}
                          setIsOpen={setIsOpen}
                          className="bg-white/10 border border-purple-600 text-white"
                        >
                          <SelectValue
                            placeholder="Your Role..."
                            value={value}
                          />
                        </SelectTrigger>
                        <SelectContent
                          isOpen={isOpen}
                          className="bg-gray-900/90 border border-purple-700 text-white"
                        >
                          {availableRoles.map((role) => (
                            <SelectItem
                              key={role}
                              value={role}
                              onValueChange={onValueChange}
                              setIsOpen={setIsOpen}
                              className="hover:bg-purple-500/20"
                            >
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </>
                    )}
                  </Select>

                  <Button
                    onClick={handleTeamRegistration}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-full py-2"
                  >
                    Save and Add Members
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h1 className="text-4xl font-semibold mb-4 text-purple-400">
                Add Team Members
              </h1>

              <Card className="bg-white/5 backdrop-blur-lg border-2 border-purple-600 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-purple-500" /> Team Members:{" "}
                    {teamMembers.length}/6
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-white/10 p-3 rounded-md border border-white/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {member.name}
                        </span>
                        {member.isLeader && (
                          <Badge className="bg-purple-600 text-white">
                            Leader
                          </Badge>
                        )}
                        <Badge className="bg-green-600 text-white text-xs">
                          {member.foodPreference || "veg"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-purple-300">
                          {member.role || "No role assigned"}
                        </span>

                        {!member.isLeader && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="border-red-400 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {teamMembers.length < 6 && (
                    <div className="space-y-4">
                      <Input
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Type UID (e.g. T250001)"
                        className="bg-white/10 border border-purple-600 placeholder-white/70 text-white"
                      />

                      <div className="space-y-2">
                        <label className="text-sm text-white">Food Preference</label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2 text-white">
                            <input
                              type="radio"
                              name="memberFood"
                              value="veg"
                              checked={memberFood === "veg"}
                              onChange={() => setMemberFood("veg")}
                              className="accent-white"
                            />
                            <span>Veg</span>
                          </label>
                          <label className="flex items-center space-x-2 text-white">
                            <input
                              type="radio"
                              name="memberFood"
                              value="non-veg"
                              checked={memberFood === "non-veg"}
                              onChange={() => setMemberFood("non-veg")}
                              className="accent-white"
                            />
                            <span>Non-Veg</span>
                          </label>
                        </div>
                      </div>

                      <Select
                        value={selectedRole}
                        onValueChange={setSelectedRole}
                      >
                        {({ isOpen, setIsOpen, value, onValueChange }) => (
                          <>
                            <SelectTrigger
                              isOpen={isOpen}
                              setIsOpen={setIsOpen}
                              className="bg-white/10 border border-purple-600 text-white"
                            >
                              <SelectValue
                                placeholder="Select role for this member..."
                                value={value}
                              />
                            </SelectTrigger>

                            <SelectContent
                              isOpen={isOpen}
                              className="bg-gray-900/90 border border-purple-700 text-white"
                            >
                              {getAvailableRoles().map((role) => (
                                <SelectItem
                                  key={role}
                                  value={role}
                                  onValueChange={onValueChange}
                                  setIsOpen={setIsOpen}
                                  className="hover:bg-purple-500/20"
                                >
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </>
                        )}
                      </Select>

                      <Button
                        onClick={handleSearchMember}
                        disabled={!searchId || !selectedRole}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-2"
                      >
                        Add Selected Member
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleFinalizeTeam}
                    disabled={!canProceed}
                    className={`w-full py-3 font-semibold rounded-full mt-4 ${
                      canProceed
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                        : "bg-white/10 border border-white/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    Finalize Team Registration
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <img
            src="/images/ai-registration-bg.png"
            alt="AI registration illustration"
            className="rounded-2xl w-full max-h-[600px] object-cover shadow-2xl"
          />
        </div>
      </main>

      {/* Custom CSS for animations */}
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

        @keyframes progress-1s {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes progress-2s {
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

        .animate-progress-1s {
          animation: progress-1s 1s ease-out;
        }

        .animate-progress-2s {
          animation: progress-2s 2s ease-out;
        }
      `}</style>
    </div>
  );
}