import { useForm as useRHForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const useForm = (schema, defaultValues = {}) => {
  return useRHForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: 'onTouched',
  });
};

export default useForm;