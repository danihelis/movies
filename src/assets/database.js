import data from './data.json';


function computeProgressiveList(data, group = 5, years = 100,
    documentary = false) {

  if (group < 1) throw new Error(`group cannot be less than 1`);

  const byYear = Map.groupBy(data, m => m.year);
  const list = new Set();
  const available = new Set();

  let year = new Date().getFullYear();
  for (let index = 0; index < years; index += group) {
    let end = year - index;
    let start = end - group + 1;
    for (let y = start; y <= end; y++) {
      byYear.get(y)
        ?.filter(m => documentary || !m.documentary)
         .forEach(m => available.add(m));
    }

    const ranked = [...available];
    ranked.sort((a, b) => (b.score - a.score) || (b.year - a.year));
    ranked.slice(0, group).forEach(m => {
      list.add(m);
      available.delete(m);
    });
  }

  return list;
}


const top = computeProgressiveList(data);

export const topByYear = [...top];
topByYear.sort((a, b) => b.year - a.year);

export const topByScore = [...top];
topByScore.sort((a, b) => b.score - a.score);

export const topByName = [...top];
topByName.sort((a, b) => a.id.localeCompare(b.id));
