import React from 'react'
import { Shield } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center transition-all duration-500">
      <div className="relative flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-400 border-b-indigo-300 border-l-blue-200 rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <p className="absolute bottom-[-3rem] text-lg font-medium text-gray-700 animate-fade-in">Loading Admin Panel...</p>
      </div>
    </div>
  )
}