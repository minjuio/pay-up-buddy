import React from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200/80 z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-4xl font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;