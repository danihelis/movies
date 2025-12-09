import { useState, useEffect } from 'react';


async function getImage(name) {
  try {
    const module = await import(`./assets/images/${name}.jpg`);
    return module.default;
  } catch {
    console.error(`cannot load image: ${name}.jpg`);
  }
}


export function Image({name, width, height, label}) {
  const [imageSrc, setImageSrc] = useState();

  useEffect(() => {
    getImage(name).then(src => setImageSrc(src));
  }, [name]);

  const style = {};
  if (width) style.width = `${width}px`;
  if (height) style.height = `${height}px`;

  return imageSrc ? (
    <img src={imageSrc} width={width} height={height} style={style} title={label} />
  ) : (
    <div className="bg-gray-300" style={style} />
  );
}
