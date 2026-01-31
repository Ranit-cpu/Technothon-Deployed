/* Event Section - FIXED */
import React, { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Trash2,
  X,
  MapPin,
  Clock,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { adminApi } from "./adminApi";

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ FIXED: Match backend field names
  const [newEvent, setNewEvent] = useState({
    name: "",              // Changed from 'title' to 'name'
    start_date: "",
    end_date: "",
    event_type: "Hardware",
    description: "",
    prize_details: "",     // Added required field
    is_live: false         // Added required field
  });

  /* ---------------- FETCH EVENTS ---------------- */

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await adminApi.getEvents();

        setEvents(
          data.map((e) => {
            const isLive = Boolean(e.is_live === 1 || e.is_live === true);

            let status;
            if (isLive) {
              status = "Live";
            } else if (new Date(e.start_date) > new Date()) {
              status = "Upcoming";
            } else {
              status = "Past";
            }

            return {
              id: e.eid || e.event_id,
              title: e.name || e.event_name,
              type: e.event_type || "Technology",
              location: e.description || "—",
              date: e.start_date || "—",
              time:
                e.start_date && e.end_date
                  ? `${e.start_date} → ${e.end_date}`
                  : "—",
              status: status,
              isLive: isLive,
            };
          })
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  /* ---------------- CREATE EVENT ---------------- */

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      // ✅ FIXED: Send data with correct field names matching backend EventIn model
      const created = await adminApi.createEvent(newEvent);

      // ✅ FIXED: Handle response properly
      setEvents((prev) => [
        {
          id: created.event_id,  // Backend returns event_id in the response message
          title: newEvent.name,  // Use the name we just sent
          type: newEvent.event_type,
          location: newEvent.description,
          date: newEvent.start_date,
          time: `${newEvent.start_date} → ${newEvent.end_date}`,
          status: "Upcoming",
          isLive: false,
        },
        ...prev,
      ]);

      setIsModalOpen(false);

      // ✅ FIXED: Reset form with correct fields
      setNewEvent({
        name: "",
        start_date: "",
        end_date: "",
        event_type: "Hardware",
        description: "",
        prize_details: "",
        is_live: false
      });
    } catch (err) {
      console.error("Create event error:", err);
      alert("Failed to create event: " + (err.message || "Unknown error"));
    }
  };

  /* ---------------- DELETE EVENT ---------------- */

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);

    try {
      await adminApi.deleteEvent(eventToDelete.id);
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));

      // Auto-close after 1 second
      setTimeout(() => {
        setShowDeleteModal(false);
        setEventToDelete(null);
      }, 1000);
    } catch {
      alert("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  /* ---------------- TOGGLE LIVE STATUS ---------------- */

  const handleToggleLive = async (id, currentStatus) => {
    try {
      await adminApi.updateEventLiveStatus(id, !currentStatus);

      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;

          const newIsLive = !currentStatus;
          let newStatus;

          if (newIsLive) {
            newStatus = "Live";
          } else if (new Date(e.date) > new Date()) {
            newStatus = "Upcoming";
          } else {
            newStatus = "Past";
          }

          return {
            ...e,
            isLive: newIsLive,
            status: newStatus
          };
        })
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update event status");
    }
  };

  /* ---------------- FILTER ---------------- */

  const filteredEvents = events.filter((event) => {
    if (filter === "All") return true;
    return event.status === filter;
  });

  if (loading) return <p className="text-white/60 p-6">Loading events...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Events Management</h2>
          <p className="text-white/60 text-xs md:text-sm">
            Manage and schedule university events
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 px-4 md:px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={18} />
          <span className="text-sm md:text-base">Create Event</span>
        </button>
      </div>

      {/* TABLE - FIXED ALIGNMENT */}
      <div className="bg-[#1a1025] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[800px]">
            <thead className="bg-[#12061f] text-white/50 text-xs uppercase">
              <tr>
                <th className="p-3 md:p-4 text-left w-[18%]">Event</th>
                <th className="p-3 md:p-4 text-left w-[12%]">Type</th>
                <th className="p-3 md:p-4 text-left w-[22%]">Date</th>
                <th className="p-3 md:p-4 text-left w-[25%]">Description</th>
                <th className="p-3 md:p-4 text-left w-[18%]">Status</th>
                <th className="p-3 md:p-4 text-right w-[5%]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 md:p-4 font-medium text-white text-left text-sm md:text-base">{event.title}</td>
                  <td className="p-3 md:p-4 text-white/70 text-left text-sm">{event.type}</td>
                  <td className="p-3 md:p-4 text-white/70 text-left text-xs md:text-sm">{event.time}</td>
                  <td className="p-3 md:p-4 text-white/70 text-left text-xs md:text-sm truncate">{event.location}</td>
                  <td className="p-3 md:p-4 text-left">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`text-xs md:text-sm ${
                        event.status === "Live"
                          ? "text-green-400"
                          : event.status === "Upcoming"
                          ? "text-blue-400"
                          : "text-gray-400"
                      }`}>
                        {event.status}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleLive(event.id, event.isLive)}
                        className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a1025] ${
                          event.isLive ? "bg-green-500" : "bg-gray-600"
                        }`}
                        title={event.isLive ? "Set as Not Live" : "Set as Live"}
                      >
                        <span
                          className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                            event.isLive ? "translate-x-5 md:translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(event)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-red-900/90 to-purple-900/90 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-scale-in">
            {/* Close button */}
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Warning Icon */}
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full"></div>
                <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-red-400 animate-bounce-in relative z-10" />
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Delete Event?
              </h2>

              {/* Message */}
              <p className="text-purple-200 text-base md:text-lg">
                Are you sure you want to delete "{eventToDelete.title}"?
              </p>

              <p className="text-xs md:text-sm text-red-300">
                This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm md:text-base font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full text-white text-sm md:text-base font-medium transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>

              {/* Progress bar when deleting */}
              {isDeleting && (
                <div className="w-full bg-red-900/50 rounded-full h-2 overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-progress-1s"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e122b] p-5 md:p-6 rounded-xl w-full max-w-md space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg md:text-xl font-bold text-white mb-4">Create New Event</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* ✅ FIXED: Changed from 'title' to 'name' */}
              <input
                placeholder="Event Name"
                className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, name: e.target.value })
                }
                required
              />

              <div>
                <label className="block text-white/60 text-xs md:text-sm mb-1">Event Type</label>
                <select
                  className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newEvent.event_type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_type: e.target.value })
                  }
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-xs md:text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newEvent.start_date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs md:text-sm mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newEvent.end_date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end_date: e.target.value })
                  }
                  required
                />
              </div>

              <input
                placeholder="Description"
                className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />

              {/* ✅ ADDED: Prize details field */}
              <input
                placeholder="Prize Details (optional)"
                className="w-full bg-[#120620] border border-white/10 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newEvent.prize_details}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, prize_details: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 py-2.5 rounded-lg text-white text-sm md:text-base font-medium transition-colors"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}

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

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-progress-1s {
          animation: progress-1s 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EventsSection;