import { useState, useEffect } from 'react';
import { FilmIcon } from '@heroicons/react/24/outline';


async function getImage(name) {
  try {
    const module = await import(`./assets/images/${name}.jpg`);
    return module.default;
  } catch {
    console.error(`cannot load image: ${name}.jpg`);
  }
}


export function Image({name, width, height, label, onClick, className}) {
  const [imageSrc, setImageSrc] = useState();

  useEffect(() => {
    getImage(name).then(src => setImageSrc(src));
  }, [name]);

  const style = {};
  if (width) style.width = `${width}px`;
  if (height) style.height = `${height}px`;

  return imageSrc ? (
    <img
      src={imageSrc}
      width={width}
      height={height}
      style={style}
      title={label}
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    />
  ) : (
    <div className="bg-gray-300 flex items-center justify-center" style={style}>
      <FilmIcon className="size-8 text-gray-400" />
    </div>
  );
}
