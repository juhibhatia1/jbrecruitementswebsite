"use client";

import React, { useEffect } from "react";
import { IoAlertCircleOutline } from "react-icons/io5";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ConfirmationModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#252e3d]/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-100 p-6 shadow-[0_12px_40px_rgba(37,55,77,0.12)] text-center animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              danger ? "bg-red-50 text-red-500" : "bg-[#f8f7ff] text-[#5a58ab]"
            }`}
          >
            <IoAlertCircleOutline className="w-7 h-7" />
          </div>
        </div>

        {/* Text Details */}
        <h3
          className="text-lg font-bold text-[#252e3d] mb-2"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer ${
              danger
                ? "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-red-600/10"
                : "bg-[#252e3d] hover:bg-[#2d3645] shadow-md"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
