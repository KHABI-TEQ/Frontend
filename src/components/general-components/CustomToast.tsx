import React from 'react';

interface CustomToastProps {
  title: string;
  subtitle: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ title, subtitle }) => {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default CustomToast;