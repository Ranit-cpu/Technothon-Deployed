import React from "react";

export default function TeamDetailsModal({ team, onClose }) {
  if (!team) return null;

  // Extract member names from the Team_Members array
  const getMembers = () => {
    if (!team.Team_Members || !Array.isArray(team.Team_Members)) return [];
    
    return team.Team_Members.map(memberObj => {
      // Each object has Member_1, Member_2, etc.
      const memberKey = Object.keys(memberObj).find(key => key.startsWith('Member_'));
      return memberObj[memberKey];
    }).filter(Boolean); // Remove any undefined/null values
  };

  const members = getMembers();

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1a0d2e] rounded-2xl shadow-xl max-w-3xl w-full p-6 relative border border-purple-600 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all"
        >
          ×
        </button>

        {/* Team Info */}
        <h2 className="text-3xl font-bold text-violet-300 mb-2 pr-8">
          {team.Team_Name}
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-1">
            <span className="text-violet-400 font-semibold">Leader:</span>{" "}
            {team.Leader_Name}
          </p>
          <p className="text-gray-300">
            <span className="text-violet-400 font-semibold">Idea:</span>{" "}
            {team.Idea_Title}
          </p>
        </div>

        {/* Idea Description */}
        {team.Idea_Description && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-violet-200 mb-3">
              About the Idea
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {team.Idea_Description}
            </p>
          </div>
        )}

        {/* Team Members */}
        {members.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-violet-200 mb-3">
              Team Members ({members.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-violet-500/20 rounded-lg p-3 hover:border-violet-500/40 transition-all"
                >
                  <p className="text-gray-200 font-medium">{member}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Video - only show if video exists */}
        {team.video && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-violet-200 mb-3">
              Demo Video
            </h3>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src={team.video}
                title="Team Video"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}