import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">

        <div className="bg-blue-600 p-3 rounded-xl mb-4 w-fit mx-auto">
          <ShieldCheck size={32} className="text-white" />
        </div>

        {status === 'loading' && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Verifying your email...</h2>
            <LoadingSpinner size="md" />
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-4">Link is invalid or expired.</p>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;