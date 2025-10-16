import React from 'react';
import EarningsScreen from './EarningsScreen';
import ProtectedScreen from '../components/ProtectedScreen';

interface ProtectedEarningsScreenProps {
  navigation: any;
}

export default function ProtectedEarningsScreen({ navigation }: ProtectedEarningsScreenProps) {
  return (
    <ProtectedScreen navigation={navigation}>
      <EarningsScreen navigation={navigation} />
    </ProtectedScreen>
  );
}
