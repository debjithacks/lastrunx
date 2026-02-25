'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  buttonText?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}: ConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2.5} />
          </div>
        )
      case 'error':
        return (
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
          </div>
        )
      case 'warning':
        return (
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-600" strokeWidth={2.5} />
          </div>
        )
      default:
        return (
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-blue-600" strokeWidth={2.5} />
          </div>
        )
    }
  }

  const getButtonClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="mb-6">
            {getIcon()}
          </div>
          
          {/* Title */}
          {title && (
            <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
              {title}
            </h3>
          )}
          
          {/* Message */}
          <p className="text-slate-600 text-center leading-relaxed whitespace-pre-line text-base mb-8">
            {message}
          </p>
          
          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 ${getButtonClasses()}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
