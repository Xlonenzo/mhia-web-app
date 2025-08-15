import React, { useState } from 'react';
import { X } from 'lucide-react';
import MHIAMultiStepForm from './forms/MHIAMultiStepForm';

interface MHIAFormModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const MHIAFormModal: React.FC<MHIAFormModalProps> = ({ onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error('Error submitting MHIA form:', error);
      // You could show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = (data: any) => {
    // Auto-save functionality - could save to localStorage or send to server
    localStorage.setItem('mhia-form-progress', JSON.stringify(data));
  };

  // Load saved progress if it exists
  const getSavedProgress = () => {
    try {
      const saved = localStorage.getItem('mhia-form-progress');
      return saved ? JSON.parse(saved) : undefined;
    } catch {
      return undefined;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative w-full min-h-screen">
        {/* Close button - positioned over the form */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 shadow-lg"
          title="Close MHIA Form"
        >
          <X className="w-6 h-6" />
        </button>

        {/* MHIA Multi-Step Form */}
        <MHIAMultiStepForm
          onSubmit={handleFormSubmit}
          onSaveProgress={handleSaveProgress}
          initialData={getSavedProgress()}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default MHIAFormModal;