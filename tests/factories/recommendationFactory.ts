import { prisma } from "../../src/database.js";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export default async function recommendationFactory(recommendation: CreateRecommendationData[]) {
  const recommendations = await prisma.recommendation.createMany({
    data: [...recommendation]
  });
  return recommendations;
}