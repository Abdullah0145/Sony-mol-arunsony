import React from 'react';
import DashboardScreen from './DashboardScreen';
import ProtectedScreen from '../components/ProtectedScreen';

interface ProtectedDashboardScreenProps {
  navigation: any;
}

export default function ProtectedDashboardScreen({ navigation }: ProtectedDashboardScreenProps) {
  return (
    <ProtectedScreen navigation={navigation}>
      <DashboardScreen navigation={navigation} />
    </ProtectedScreen>
  );
}
