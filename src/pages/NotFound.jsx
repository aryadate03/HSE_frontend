import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldAlert size={64} className="text-blue-600 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;