"use client";

import React from "react";

type ServiceCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export default function ServiceCard({
  title,
  description,
  icon,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center rounded-full p-3 bg-gradient-to-br from-[#5a58ab] to-[#5d8aba] text-white shadow-md">
          {icon}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[#252e3d] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}

      <button
        aria-label={`More about ${title}`}
        className="mt-4 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
      >
        +
      </button>
    </div>
  );
}
