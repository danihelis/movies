import { useState, useEffect } from 'react';
import { Header } from './Header.jsx';
import { Page } from './Page.jsx';


export default function App() {

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="flex-grow flex flex-col max-w-[1024px] max-h-dvh h-dvh bg-white">
        <Header />
        <Page />
      </div>
    </div>
  )
}
