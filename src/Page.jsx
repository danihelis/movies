import { useState, useEffect } from 'react';
import { topByYear, topByScore } from './assets/database.js';
import imdb from './assets/logos/imdb.png';
import metacritic from './assets/logos/metacritic.png';
import rotten from './assets/logos/rotten-tomatoes.png';
import { Image } from './Image.jsx';
import { Footer } from './Footer.jsx';
import { CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';


function Modal({onClose, image}) {

  return (
    <Dialog open={!!image} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/80" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="">
          {image && <Image name={image} onClick={onClose} />}
          <div className="text-xs text-center text-gray-400 mt-2">Click on the image to exit</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}


function Movie({movie, rank, onClick}) {


  return (
    <div className="flex gap-2 max-w-md w-full bg-gray-200 rounded-lg">
      <div className="shrink-0 relative">
        <Image name={movie.id} width={118} height={170} onClick={onClick} />
        <span className="absolute -top-1 -left-1 bg-gray-700 text-lg text-white font-bold px-2 rounded">
          {rank}
        </span>
      </div>
      <div className="flex-grow flex flex-col gap-2 p-2 justify-between relative">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{movie.year}</span>
            <div className="flex gap-1 items-center text-sm">
            </div>
          </div>
          <p className="line-clamp-2 font-semibold">{movie.name}</p>
          {null && <p className="text-xs font-mono">{movie.id}</p>}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-01 items-center">
          <img src={metacritic} width={20} title="Metacritic" className="justify-self-center" />
          <div className="flex gap-1 items-baseline">
            <span className="">{movie.meta}</span>
            <span className="text-xs text-gray-600" title="User score">/ {movie.meta_user}</span>
          </div>

          <img src={rotten} width={16} title="Rotten Tomatoes" className="justify-self-center" />
          <div className="flex gap-1 items-baseline">
            <span className="">{movie.rotten}%</span>
            <span className="text-xs text-gray-600" title="User score">/ {movie.rotten_user}%</span>
          </div>

          <img src={imdb} width={30} title="IMDb" />
          <span className="">{(movie.imdb / 10).toFixed(1)}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-gray-500 text-sm text-white p-1 px-2 rounded flex gap-1 items-center">
          <SolidStarIcon className="size-4" />
          <span className="">{movie.score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}


function Selector({method, setMethod}) {
  const selectedStyle = '';
  const notSelectedStyle = '';

  const createMethod = (value, Icon, label, position) => {
    const selected = value === method;
    let style = selected ? 'bg-gray-600 text-white' : 'bg-gray-200 cursor-pointer';
    style += position === -1 ? ' rounded-l-lg' : position === 1 ? ' rounded-r-lg' : '';
    return (
      <button
        className={`flex gap-2 p-1 px-3 items-center ${style}`}
        onClick={() => setMethod(value)}
      >
        <Icon className="size-5" />
        <span className="">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex justify-center items-baseline py-4">
      {createMethod('year', CalendarIcon, 'By year', -1)}
      {createMethod('score', StarIcon, 'By score', 1)}
    </div>
  );
}


export function Page() {
  const [sort, setSort] = useState('year');
  const [showImage, setShowImage] = useState();
  const list = sort === 'year' ? topByYear : topByScore;

  return (
    <div className="flex-grow min-h-0 p-4 overflow-y-auto flex flex-col items-center gap-4">
      <Selector method={sort} setMethod={setSort} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6 justify-center">
        {list.map((m, i) =>
          <Movie key={m.id} movie={m} rank={i + 1} onClick={() => setShowImage(m.id)} />
        )}
      </div>
      <Modal onClose={() => setShowImage(null)} image={showImage} />
      <Footer />
    </div>
  )
}
