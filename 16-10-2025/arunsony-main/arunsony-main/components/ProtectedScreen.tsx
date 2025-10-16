import React from 'react';
import SimplePaymentGuard from './SimplePaymentGuard';

interface ProtectedScreenProps {
  children: React.ReactNode;
  navigation: any;
}

export default function ProtectedScreen({ children, navigation }: ProtectedScreenProps) {
  return (
    <SimplePaymentGuard navigation={navigation}>
      {children}
    </SimplePaymentGuard>
  );
}
