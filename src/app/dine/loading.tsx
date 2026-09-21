import React from 'react';

export default function DineLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="h-10 w-48 bg-slate-200 rounded animate-pulse mb-4"></div>
      <div className="h-6 w-64 bg-slate-200 rounded animate-pulse mb-8"></div>
      
      {/* Filters skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="h-10 w-full sm:w-64 bg-slate-200 rounded animate-pulse"></div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6 overflow-x-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-slate-200 rounded-full animate-pulse flex-shrink-0"></div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-36 sm:h-40 bg-slate-200 animate-pulse"></div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-5 w-1/4 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse mb-4"></div>
              
              <div className="mt-auto flex items-center justify-between border-t pt-3 gap-3">
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
