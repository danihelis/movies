import { useState, useEffect } from 'react';
import { topByYear } from './assets/database.js';
import imdb from './assets/logos/imdb.png';
import metacritic from './assets/logos/metacritic.png';
import rotten from './assets/logos/rotten-tomatoes.png';
import { Image } from './Image.jsx';



function Movie({movie, rank}) {

  // <span className="text-gray-400 font-bold">{movie.score.toFixed(1)}</span>

  return (
    <div className="flex gap-2 max-w-md w-full bg-gray-200 rounded-lg">
      <div className="shrink-0 relative">
        <Image name={movie.id} width={118} height={170} />
        <span className="absolute -bottom-1 -left-1 bg-gray-700 text-lg text-white font-bold px-2 rounded">
          {rank}
        </span>
      </div>
      <div className="flex-grow flex flex-col gap-2 p-2 justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">{movie.year}</span>
          <p className="line-clamp-2 font-semibold">{movie.name}</p>
          {null && <p className="text-xs font-mono">{movie.id}</p>}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-01 items-center">
          <img src={metacritic} width={20} title="Metacritic" className="justify-self-center" />
          <div className="flex gap-1 items-center">
            <span className="">{movie.meta}</span>
            <span className="text-xs text-gray-600" title="User score">/ {movie.meta_user}</span>
          </div>

          <img src={rotten} width={16} title="Rotten Tomatoes" className="justify-self-center" />
          <div className="flex gap-1 items-center">
            <span className="">{movie.rotten}%</span>
            <span className="text-xs text-gray-600" title="User score">/ {movie.rotten_user}%</span>
          </div>

          <img src={imdb} width={30} title="IMDb" />
          <span className="">{(movie.imdb / 10).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}


export function Page() {

  return (
    <div className="flex-grow min-h-0 p-4 overflow-y-auto flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
        {topByYear.map((m, i) =>
          <Movie key={m.id} movie={m} rank={i + 1} />
        )}
      </div>
    </div>
  )
}
