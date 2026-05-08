import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useForm from '../../hooks/useForm';
import { resetPasswordSchema } from '../../utils/validators';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm(resetPasswordSchema);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-3">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          <InputField label="New Password" name="password" type="password" placeholder="••••••••" register={register} error={errors.password?.message} required />
          <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" register={register} error={errors.confirmPassword?.message} required />
          <Button type="submit" loading={loading} fullWidth>Reset Password</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;