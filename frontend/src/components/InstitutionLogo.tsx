import React from 'react';

export const InstitutionLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    className={className}
    src="/images/nec-logo.png"
    alt="Narasaraopeta Engineering College logo"
  />
);
