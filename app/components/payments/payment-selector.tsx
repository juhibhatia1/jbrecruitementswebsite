"use client";

import React from "react";
import { FaCreditCard } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";

export type PaymentGatewayOption = "STRIPE" | "PAYU";

interface PaymentSelectorProps {
  selectedGateway: PaymentGatewayOption;
  onChange: (gateway: PaymentGatewayOption) => void;
  disabled?: boolean;
}

export function PaymentSelector({ selectedGateway, onChange, disabled }: PaymentSelectorProps) {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-gray-700">Select Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Stripe Option */}
        <label
          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
            selectedGateway === "STRIPE"
              ? "border-blue-600 bg-blue-50/50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="payment_gateway"
            value="STRIPE"
            checked={selectedGateway === "STRIPE"}
            onChange={() => onChange("STRIPE")}
            disabled={disabled}
            className="sr-only"
          />
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
            <FaCreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">International Cards</div>
            <div className="text-xs text-gray-500">Stripe Global</div>
          </div>
        </label>

        {/* PayU Option */}
        <label
          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
            selectedGateway === "PAYU"
              ? "border-blue-600 bg-blue-50/50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="payment_gateway"
            value="PAYU"
            checked={selectedGateway === "PAYU"}
            onChange={() => onChange("PAYU")}
            disabled={disabled}
            className="sr-only"
          />
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
            <FaSpinner className="mr-2 h-4 w-4 animate-spin text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">UPI & Indian Cards</div>
            <div className="text-xs text-gray-500">PayU India</div>
          </div>
        </label>

      </div>
    </div>
  );
}
