/* GlassCard.jsx - ENHANCED */

const GlassCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-[#1a1025] border border-white/5 rounded-2xl overflow-hidden ${className}`}
  >
    {title && (
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default GlassCard;