"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";

interface PayUCheckoutProps {
  paymentUrl: string;
  metadata: Record<string, string>;
  onCancel: () => void;
}

export function PayUCheckout({ paymentUrl, metadata, onCancel }: PayUCheckoutProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = () => {
    setIsRedirecting(true);
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Auto-redirect after 3 seconds or allow manual click
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRedirect();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
        <FaSpinner className="w-8 h-8 text-green-600 animate-spin" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Redirecting to PayU</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Please wait while we redirect you securely to PayU to complete your payment via UPI, Netbanking, or Card.
        </p>
      </div>

      <form ref={formRef} action={paymentUrl} method="POST" className="hidden">
        {Object.entries(metadata).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>

      <div className="pt-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <button 
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition w-full sm:w-auto"
          onClick={onCancel}
          disabled={isRedirecting}
        >
          Cancel
        </button>
        <button
          onClick={handleRedirect}
          disabled={isRedirecting}
          className="w-full sm:w-auto bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3 px-6 rounded-xl font-semibold transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isRedirecting ? (
            <>
              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-6 pt-4 border-t w-full text-center">
        Secured by PayU · PCI DSS Certified
      </p>
    </div>
  );
}
