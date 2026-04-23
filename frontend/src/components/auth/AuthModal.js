'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthModal({ mode, onClose, onSwitch }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass rounded-2xl w-full max-w-md mx-4 p-8 relative animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {mode === 'login'
          ? <LoginForm onClose={onClose} onSwitch={() => onSwitch('signup')} />
          : <SignupForm onClose={onClose} onSwitch={() => onSwitch('login')} />
        }
      </div>
    </div>
  );
}
