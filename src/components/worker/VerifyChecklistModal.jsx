import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import buddyService from '../../services/buddyService';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const VerifyChecklistModal = ({ isOpen, onClose, pair, onCompleted }) => {
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('checklist'); // checklist | confirm | done

  if (!pair) return null;

  const checklist = pair.checklist || [];
  const allAnswered = checklist.length > 0 && checklist.every((item) => answers[item._id] !== undefined);
  const allYes = allAnswered && Object.values(answers).every((a) => a === true);

  const handleAnswer = async (itemId, answer) => {
    setAnswers((prev) => ({ ...prev, [itemId]: answer }));
    try {
      await buddyService.answerChecklist(pair._id, itemId, answer);
    } catch (err) {
      console.error('Failed to save answer', err);
    }
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await buddyService.confirmVerify(pair._id, notes);
      if (res.data.bothConfirmed) {
        setStep('done');
      } else {
        setStep('confirm');
      }
      onCompleted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤝 Joint Safety Verify" size="md">
      {step === 'checklist' && (
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm text-blue-700 font-medium">2-Minute Safety Check</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Go through each item together with your buddy. Both of you must confirm at the end.
            </p>
          </div>

          {/* Checklist Items */}
          <div className="flex flex-col gap-3">
            {checklist.map((item, i) => (
              <div
                key={item._id}
                className={`p-3 rounded-xl border transition-all
                  ${answers[item._id] === true  ? 'border-green-300 bg-green-50' :
                    answers[item._id] === false ? 'border-red-300 bg-red-50' :
                    'border-gray-200 bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0 w-5">{i + 1}.</span>
                  <p className="text-sm text-gray-700 flex-1 leading-relaxed">{item.question}</p>
                </div>
                <div className="flex gap-2 mt-3 ml-5">
                  <button
                    onClick={() => handleAnswer(item._id, true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${answers[item._id] === true
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}
                  >
                    <CheckCircle size={14} /> Yes
                  </button>
                  <button
                    onClick={() => handleAnswer(item._id, false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${answers[item._id] === false
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'}`}
                  >
                    <XCircle size={14} /> No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Warning if any No */}
          {allAnswered && !allYes && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                Some items were marked <strong>No</strong>. Please resolve these issues with your supervisor before starting work.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Any concerns or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleConfirm}
              disabled={!allAnswered}
              loading={loading}
              className="flex-1"
            >
              Confirm My Part ✅
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle size={36} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Your Part Done!</p>
            <p className="text-sm text-gray-500 mt-1">
              Waiting for your buddy to confirm their part. You'll get notified when they do.
            </p>
          </div>
          <Button onClick={onClose} fullWidth>Close</Button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Joint Safety Verify Complete! 🎉</p>
            <p className="text-sm text-gray-500 mt-1">
              Both you and your buddy have confirmed. Your safety score has been updated. Work safely!
            </p>
          </div>
          <Button onClick={onClose} fullWidth>Close</Button>
        </div>
      )}
    </Modal>
  );
};

export default VerifyChecklistModal;