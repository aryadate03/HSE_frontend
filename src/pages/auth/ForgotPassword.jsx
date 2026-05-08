import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import useForm from '../../hooks/useForm';
import { forgotPasswordSchema } from '../../utils/validators';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm(forgotPasswordSchema);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(data.email);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">Enter your email and we'll send a reset link</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <ErrorMessage message={error} />
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>
          )}
          <InputField label="Email" name="email" type="email" placeholder="you@example.com" register={register} error={errors.email?.message} required />
          <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 font-medium hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;