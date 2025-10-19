import React from 'react';
import ReferralsScreen from './ReferralsScreen';
import ProtectedScreen from '../components/ProtectedScreen';

interface ProtectedTeamScreenProps {
  navigation: any;
}

export default function ProtectedTeamScreen({ navigation }: ProtectedTeamScreenProps) {
  return (
    <ProtectedScreen navigation={navigation}>
      <ReferralsScreen navigation={navigation} />
    </ProtectedScreen>
  );
}
