import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { incidentSchema } from '../../utils/validators';
import { INCIDENT_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ErrorMessage from '../../components/common/ErrorMessage';
import Dropdown from '../../components/common/Dropdown';
import api from '../../services/api';
import { CheckCircle, X, Upload, MapPin, FileText, AlertTriangle, Users, Camera, ArrowLeft, Clock, Cloud } from 'lucide-react';

const SEVERITY_OPTIONS = [
  { value: 'low',      label: '🟢 Low',      selected: 'bg-green-500 text-white border-green-500',   normal: 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50' },
  { value: 'medium',   label: '🟡 Medium',   selected: 'bg-yellow-500 text-white border-yellow-500', normal: 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50' },
  { value: 'high',     label: '🟠 High',     selected: 'bg-orange-500 text-white border-orange-500', normal: 'bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50' },
  { value: 'critical', label: '🔴 Critical', selected: 'bg-red-500 text-white border-red-500',       normal: 'bg-white border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50' },
];

const WEATHER_OPTIONS = [
  { value: 'sunny', label: '☀️ Sunny' },
  { value: 'rainy', label: '🌧️ Rainy' },
  { value: 'foggy', label: '🌫️ Foggy' },
  { value: 'night', label: '🌙 Night' },
  { value: 'windy', label: '💨 Windy' },
  { value: 'cloudy', label: '☁️ Cloudy' },
];

const SectionHeader = ({ icon: Icon, title, color = 'text-blue-600', bg = 'bg-blue-50' }) => (
  <div className={`flex items-center gap-2 px-3 py-2 ${bg} rounded-lg mb-3`}>
    <Icon size={16} className={color} />
    <span className={`text-sm font-semibold ${color}`}>{title}</span>
  </div>
);

const IncidentReportForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading]             = useState(false);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [selectedSeverity, setSeverity]   = useState('');
  const [selectedWeather, setWeather]     = useState('');
  const [incidentTime, setIncidentTime]   = useState('');
  const [hasInjury, setHasInjury]         = useState(false);
  const [witnesses, setWitnesses]         = useState([{ name: '', contact: '' }]);
  const [photos, setPhotos]               = useState([]);
  const [descLength, setDescLength]       = useState(0);
  const [error, setError]                 = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(incidentSchema),
  });

  const addWitness = () => {
    if (witnesses.length < 3) setWitnesses([...witnesses, { name: '', contact: '' }]);
  };
  const removeWitness = (i) => setWitnesses(witnesses.filter((_, idx) => idx !== i));
  const updateWitness = (i, field, value) => {
    const updated = [...witnesses];
    updated[i][field] = value;
    setWitnesses(updated);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) { alert('Maximum 5 photos allowed'); return; }
    const newPhotos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos([...photos, ...newPhotos]);
  };
  const removePhoto = (i) => setPhotos(photos.filter((_, idx) => idx !== i));

  const onSubmit = async (data, isDraft = false) => {
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('incidentType', data.incidentType);
      formData.append('description',  data.description);
      formData.append('severity',     data.severity);
      formData.append('hasInjury',    hasInjury);
      formData.append('isDraft',      isDraft);

      // Combine date + time for dateTime field
      const now = new Date();
      if (incidentTime) {
        const [hours, minutes] = incidentTime.split(':');
        now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      formData.append('dateTime', now.toISOString());

      if (selectedWeather) formData.append('weatherCondition', selectedWeather);

      formData.append('location[building]',      data.location?.building      || '');
      formData.append('location[floor]',         data.location?.floor         || '');
      formData.append('location[zone]',          data.location?.zone          || '');
      formData.append('location[manualAddress]', data.location?.manualAddress || '');

      witnesses.filter((w) => w.name.trim()).forEach((w, i) => {
        formData.append(`witnesses[${i}][name]`,    w.name);
        formData.append(`witnesses[${i}][contact]`, w.contact);
      });

      photos.forEach((p) => formData.append('photos', p.file));

      await api.post('/worker/incidents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (!isDraft) setShowSuccess(true);
      else navigate('/worker/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors
    ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Report Incident</h1>
            <p className="text-xs text-gray-500">Fill in all required fields marked with *</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="flex flex-col gap-5">

          {error && <ErrorMessage message={error} />}

          {/* Incident Type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <SectionHeader icon={AlertTriangle} title="Incident Details" color="text-red-600" bg="bg-red-50" />
            <Dropdown
              label="Incident Type" name="incidentType"
              options={INCIDENT_TYPES} register={register}
              error={errors.incidentType?.message} required
            />
          </div>

          {/* Time of Incident + Weather — side by side */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="grid grid-cols-2 gap-4">

              {/* Time of Incident */}
              <div>
                <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-lg mb-3">
                  <Clock size={16} className="text-sky-600" />
                  <span className="text-sm font-semibold text-sky-600">Time of Incident</span>
                </div>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white text-gray-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1.5">Leave blank to use current time</p>
              </div>

              {/* Weather Conditions */}
              <div>
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 rounded-lg mb-3">
                  <Cloud size={16} className="text-cyan-600" />
                  <span className="text-sm font-semibold text-cyan-600">Weather</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {WEATHER_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setWeather(selectedWeather === w.value ? '' : w.value)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all text-center
                        ${selectedWeather === w.value
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50'
                        }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <SectionHeader icon={MapPin} title="Location" color="text-blue-600" bg="bg-blue-50" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Building</label>
                <input {...register('location.building')} placeholder="Block A" className={inputClass(false)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Floor</label>
                <input {...register('location.floor')} placeholder="3rd Floor" className={inputClass(false)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Zone</label>
                <input {...register('location.zone')} placeholder="Zone 1" className={inputClass(false)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Manual Address</label>
                <input {...register('location.manualAddress')} placeholder="Near Gate 2" className={inputClass(false)} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <SectionHeader icon={FileText} title="Description" color="text-purple-600" bg="bg-purple-50" />
            <textarea
              rows={4}
              placeholder="Describe the incident in detail (minimum 50 characters)..."
              {...register('description')}
              onChange={(e) => setDescLength(e.target.value.length)}
              className={inputClass(!!errors.description) + ' resize-none'}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              <p className={`text-xs ml-auto font-medium ${descLength < 50 ? 'text-red-400' : 'text-green-600'}`}>
                {descLength}/50 min
              </p>
            </div>
          </div>

          {/* Severity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <SectionHeader icon={AlertTriangle} title="Severity Level" color="text-orange-600" bg="bg-orange-50" />
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s.value} type="button"
                  onClick={() => { setSeverity(s.value); setValue('severity', s.value); }}
                  className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${selectedSeverity === s.value ? s.selected : s.normal}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.severity && <p className="text-xs text-red-500 mt-2">{errors.severity.message}</p>}

            {/* Injury toggle */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Injury Involved?</p>
                <p className="text-xs text-gray-500 mt-0.5">Did this incident result in any injury?</p>
              </div>
              <button
                type="button" onClick={() => setHasInjury(!hasInjury)}
                className={`relative w-12 h-6 rounded-full transition-colors ${hasInjury ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasInjury ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            {hasInjury && (
              <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium">⚠️ Injury reported — supervisor will be notified immediately</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <SectionHeader icon={Camera} title="Photos (max 5)" color="text-teal-600" bg="bg-teal-50" />
            <div className="grid grid-cols-4 gap-2 mb-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Upload</span>
                  <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">{photos.length}/5 photos • JPG/PNG only • 5MB max</p>
          </div>

          {/* Witnesses */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
                <Users size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-600">Witnesses</span>
              </div>
              {witnesses.length < 3 && (
                <button type="button" onClick={addWitness}
                  className="text-xs text-blue-600 font-semibold hover:text-blue-700 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  + Add Witness
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {witnesses.map((w, i) => (
                <div key={i} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <input
                    placeholder="Full Name" value={w.name}
                    onChange={(e) => updateWitness(i, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white text-gray-800 placeholder-gray-400"
                  />
                  <input
                    placeholder="Contact" value={w.contact}
                    onChange={(e) => updateWitness(i, 'contact', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white text-gray-800 placeholder-gray-400"
                  />
                  {witnesses.length > 1 && (
                    <button type="button" onClick={() => removeWitness(i)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors bg-white">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit((data) => onSubmit(data, true))}
              className="flex-1 py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors bg-white">
              Save Draft
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); navigate('/worker/dashboard'); }} title="Incident Reported!" size="sm">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <div>
            <p className="text-gray-800 font-semibold">Report Submitted!</p>
            <p className="text-gray-500 text-sm mt-1">Your supervisor will review it shortly.</p>
          </div>
          <Button onClick={() => { setShowSuccess(false); navigate('/worker/dashboard'); }} fullWidth>
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentReportForm;