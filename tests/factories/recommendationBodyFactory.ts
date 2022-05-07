
export function recommendationBodyFactory(quantity: number): any {
  const recommendations = [];

  for(let i = 0; i < quantity;i++)
  recommendations.push({
    name: `recommendation${i}`,
      youtubeLink: `https://www.youtube.com/watch?v=B3gAZvncfa0${i}`
  });

  return recommendations;
}

export function recommendationBodyFactoryFull(quantity: number): any {
  const recommendations = [];

  for(let i = 0; i < quantity;i++)
  recommendations.push({
    id: i,
    name: `recommendation${i}`,
      youtubeLink: `https://www.youtube.com/watch?v=B3gAZvncfa0${i}`,
      score: 0
  });

  return recommendations;
}