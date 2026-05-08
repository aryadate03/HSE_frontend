import * as yup from 'yup';

// ─── Auth Validators ──────────────────────────────────────────────────────────
export const loginSchema = yup.object({
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail addresses are allowed (@gmail.com)')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup.string().min(2, 'Name too short').required('Name is required'),
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail addresses are allowed (@gmail.com)')
    .required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  role: yup.string().required('Role is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .optional(),
  department: yup.string().optional(),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail addresses are allowed (@gmail.com)')
    .required('Email is required'),
});

export const resetPasswordSchema = yup.object({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
});

// ─── Incident Validators ──────────────────────────────────────────────────────
export const incidentSchema = yup.object({
  incidentType: yup.string().required('Incident type is required'),
  description: yup
    .string()
    .min(50, 'Description must be at least 50 characters')
    .required('Description is required'),
  severity: yup.string().required('Severity is required'),
  location: yup.object({
    building:      yup.string().optional(),
    floor:         yup.string().optional(),
    zone:          yup.string().optional(),
    manualAddress: yup.string().optional(),
  }),
});