import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Always wear your Personal Protective Equipment (PPE) on site.',
  'Report near-misses immediately — they prevent future accidents.',
  'Never bypass safety guards or interlocks.',
  'Keep your work area clean and free of hazards.',
  'Know the location of fire extinguishers and emergency exits.',
  'Do not operate equipment you are not trained for.',
  'Stay hydrated and take regular breaks in hot conditions.',
];

const SafetyTipsCard = () => {
  const tip = TIPS[new Date().getDay() % TIPS.length];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className="text-yellow-500" />
        <h3 className="text-sm font-semibold text-yellow-700">Safety Tip of the Day</h3>
      </div>
      <p className="text-sm text-yellow-800">{tip}</p>
    </div>
  );
};

export default SafetyTipsCard;