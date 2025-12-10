import { useState, useEffect } from 'react';


export function Header() {

  return (
    <div className="flex flex-col items-center bg-gray-900 text-white p-4">
      <span className="text-xl font-bold uppercase">Top Movies</span>
      <span className="max-sm:hidden">A selection of 100 high-scoring movies along the years</span>
      <span className="text-center sm:hidden">A selection of movies along the years</span>
    </div>
  )
}
