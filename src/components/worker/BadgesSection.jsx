import { ShieldCheck } from 'lucide-react';

const ALL_BADGES = [
  { name: 'First Verify',  icon: '🤝', description: 'Complete your first Joint Safety Verify' },
  { name: 'Perfect Week',  icon: '⭐', description: '7 consecutive days of completed verifies' },
  { name: 'Hazard Hunter', icon: '🔍', description: 'Report 5 or more hazards' },
  { name: 'Safety Star',   icon: '🌟', description: 'Reach 500 credit points' },
  { name: 'Iron Worker',   icon: '🏆', description: '30-day verify streak' },
  { name: 'Incident Free', icon: '🛡️', description: '30 consecutive incident-free days' },
  { name: 'Top Performer', icon: '👑', description: 'Rank #1 on site leaderboard' },
];

const BadgesSection = ({ earnedBadges = [] }) => {
  const earnedNames = earnedBadges.map((b) => b.name);

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-yellow-400" />
        <h3 className="font-bold text-white">Badges</h3>
        <span className="ml-auto text-xs text-gray-400">
          {earnedBadges.length}/{ALL_BADGES.length} earned
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {ALL_BADGES.map((badge) => {
          const isEarned = earnedNames.includes(badge.name);
          const earned = earnedBadges.find((b) => b.name === badge.name);
          return (
            <div
              key={badge.name}
              title={`${badge.name}: ${badge.description}`}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                ${isEarned
                  ? 'border-yellow-400/40 bg-yellow-400/10'
                  : 'border-white/5 bg-white/5 opacity-40 grayscale'}`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <p className={`text-xs font-medium text-center leading-tight ${isEarned ? 'text-yellow-300' : 'text-gray-500'}`}>
                {badge.name}
              </p>
              {isEarned && earned?.earnedAt && (
                <p className="text-xs text-gray-500 text-center">
                  {new Date(earned.earnedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {earnedBadges.length === 0 && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Complete your first Joint Safety Verify to earn your first badge!
        </p>
      )}
    </div>
  );
};

export default BadgesSection;