'use client';

import React from 'react';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-slate-100 text-slate-700 border px-6 py-2 rounded-md hover:bg-slate-200">
      Print Receipt
    </button>
  );
}
