import { useState, useCallback } from 'react';
import { PersonalInfo } from '../types';
import { storageUtils } from '../utils/storage';

export function usePersonalInfo() {
  const [info, setInfo] = useState<Partial<PersonalInfo>>(() => storageUtils.getPersonalInfo());

  const updateInfo = useCallback((updates: Partial<PersonalInfo>) => {
    const newInfo = { ...info, ...updates };
    setInfo(newInfo);
    storageUtils.savePersonalInfo(newInfo);
  }, [info]);

  const clearInfo = useCallback(() => {
    setInfo({});
    storageUtils.savePersonalInfo({});
  }, []);

  return { info, updateInfo, clearInfo };
}
