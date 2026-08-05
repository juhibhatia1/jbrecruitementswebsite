"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  IoCheckmarkCircle,
  IoCopyOutline,
  IoMailOutline,
  IoQrCodeOutline,
  IoInformationCircleOutline,
  IoOpenOutline,
} from "react-icons/io5";

interface UpiPaymentBoxProps {
  amount: number;
  currency: string;
  serviceName: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
}

export default function UpiPaymentBox({
  amount,
  currency,
  serviceName,
  candidateName = "",
  candidateEmail = "",
  candidatePhone = "",
}: UpiPaymentBoxProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const payeeVpa = "9971012125@ptyes";
  const payeeName = "JUHI BHATIA";
  const isINR = currency.toUpperCase() === "INR" || currency === "₹";
  const displayAmount = isINR
    ? `₹${amount.toLocaleString("en-IN")}`
    : `${currency} ${amount.toLocaleString()}`;

  // Build NPCI compliant UPI payment deep link URL with dynamic amount
  const note = `Payment for ${serviceName}`.substring(0, 45);
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiDeepLink, {
      margin: 2,
      width: 320,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate dynamic UPI QR code:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiDeepLink]);

  const emailTo = "contact@jbrecruitments.com";
  const emailSubject = encodeURIComponent(`UPI Payment Proof - ${serviceName}`);
  const emailBody = encodeURIComponent(
    `Hi JB Recruitment Solutions Team,\n\nI have completed the UPI payment for the service: ${serviceName}.\n\nPayment Details:\n- Name: ${candidateName || "[Your Name]"}\n- Email: ${candidateEmail || "[Your Email]"}\n- Phone/WhatsApp: ${candidatePhone || "[Your Phone]"}\n- Service: ${serviceName}\n- Amount Paid: ${displayAmount}\n\nPlease find attached my payment screenshot / UTR transaction reference ID.\n\nThank you!`
  );

  const mailtoUrl = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 animate-fadeIn">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#5a58ab]/10 flex items-center justify-center text-[#5a58ab] shrink-0">
            <IoQrCodeOutline className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">UPI QR Code</h4>
            <p className="text-[11px] text-slate-500">Amount auto-set to {displayAmount} on scan</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-[#5a58ab] bg-[#5a58ab]/5 px-3 py-1 rounded-full border border-[#5a58ab]/20">
          {displayAmount}
        </span>
      </div>

      {/* Dynamic QR Code Container */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`UPI QR Code for ${displayAmount} - JB Recruitment Solutions`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Image
              src="/payment/qrcode.png"
              alt="UPI QR Code - JB Recruitment Solutions"
              width={220}
              height={220}
              className="w-full h-full object-contain"
              priority
            />
          )}
        </div>
        
        <div className="mt-3 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800">
            Scan to Pay <span className="text-[#5a58ab]">{displayAmount}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            UPI VPA: <code className="bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-800 font-mono font-semibold">{payeeVpa}</code>
          </p>
        </div>

        {/* Deep Link for Mobile Users Only */}
        <a
          href={upiDeepLink}
          className="mt-3 sm:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a58ab] bg-[#5a58ab]/10 hover:bg-[#5a58ab]/20 px-3.5 py-1.5 rounded-lg transition"
        >
          <span>Pay via Installed UPI App</span>
          <IoOpenOutline className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <IoInformationCircleOutline className="w-4 h-4 text-[#5a58ab]" />
          <span>Instructions to Buy the Service:</span>
        </h5>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="w-5 h-5 rounded-full bg-[#5a58ab] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
            <p>Scan the QR code above — the amount <strong>{displayAmount}</strong> will be pre-filled automatically in GPay, PhonePe, Paytm, BHIM, or CRED.</p>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="w-5 h-5 rounded-full bg-[#5a58ab] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
            <p>
              Take a screenshot of your successful transaction and email it to{" "}
              <strong className="text-slate-900 font-semibold">contact@jbrecruitments.com</strong> along with your name & service name.
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-emerald-900">
            <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p>Our team will verify your payment and activate your service / send your link shortly via email.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
        <a
          href={mailtoUrl}
          className="flex-1 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
        >
          <IoMailOutline className="w-4 h-4" />
          <span>Send Payment Screenshot via Email</span>
        </a>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
        >
          {copied ? (
            <>
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-600" />
              <span>Copied Email!</span>
            </>
          ) : (
            <>
              <IoCopyOutline className="w-4 h-4" />
              <span>Copy Email</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
