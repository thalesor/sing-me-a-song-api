import  app  from '../src/app.js';
import { jest } from "@jest/globals";
import supertest from 'supertest';
import { prisma } from "../src/database.js";
import { recommendationSchema } from "../src/schemas/recommendationsSchemas";
import { recommendationBodyFactory } from "./factories/recommendationBodyFactory";
import recommendationFactory from "./factories/recommendationFactory";

describe("GET recommendations/", () => {
  beforeEach(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should return recommendations list with length greather than 0 and status code 200", async () => {
      const recommendations = recommendationBodyFactory(10);
      await recommendationFactory(recommendations);
      const { body: data, status } = await supertest(app).get("/recommendations");

      expect(status).toBe(200);
      expect(data).not.toBe(null);
      expect(data.length).toEqual(10);
  });
  
});

describe("GET recommendations/random", () => {

  beforeAll(truncateRecommendations);
  afterAll(disconnect);

  it("it should return a single random recommendation and status 200", async () => {
    const recommendations = recommendationBodyFactory(5);
    await recommendationFactory(recommendations);
    const { body: data, status } = await supertest(app).get("/recommendations/random");

    expect(status).toBe(200);
    expect(data).not.toBe(null);
  });

});

describe("GET recommendations/top/amount", () => {
  beforeAll(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should return recommendations list with length based on amount with status code 200", async () => {
      const recommendations = recommendationBodyFactory(4);
      await recommendationFactory(recommendations);
      await prisma.recommendation.update({
        where: { id: 1 },
        data: {
          score: { ['increment']: 1 },
        },
      });
      const { body: data, status } = await supertest(app).get(`/recommendations/top/4`);
      
      expect(status).toBe(200);
      expect(data).not.toBe(null);
      expect(data.length).toEqual(4);
      expect(data[0].score).toBeGreaterThan(data[1].score);
  });
  
});

describe("GET recommendations/:id", () => {

  beforeEach(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should return a single recommendation based on id, and should return also status 200", async () => {
    const recommendations = recommendationBodyFactory(1);
    await recommendationFactory(recommendations);
    const { body: data, status } = await supertest(app).get("/recommendations/1");
    
    expect(status).toBe(200);
    expect(data).not.toBe(null);
  });
});


describe("POST recommendations/", () => {

  beforeEach(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should persist a recommendation and should also return status 200", async () => {
    const recommendationBody = recommendationBodyFactory(1);
    const { status } = await supertest(app).post(`/recommendations/`).send(recommendationBody[0]);
    const recommendation = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    
    expect(status).toEqual(201);
    expect(recommendation).not.toBeNull();
  });
  
  it("it should not persist the same recommendation twice and should also return status code 409", async () => {
    const recommendationBody = recommendationBodyFactory(1);
    const { status: status1 } = await supertest(app).post(`/recommendations/`).send(recommendationBody[0]);
    jest.spyOn(global.console,'log').mockReturnValueOnce(null);
    const { status: status2 } = await supertest(app).post(`/recommendations/`).send(recommendationBody[0]);
    const recommendation = await prisma.recommendation.findUnique({
      where: {
        id: 2
      }
    });
    
    expect(status1).toEqual(201);
    expect(status2).toEqual(409);
    expect(recommendation).toBeNull();

  });
  
  it("it should not persist a recommendation if missing body data and should also return status code 422", async () => {
    const recommendationBody = recommendationBodyFactory(1);
    jest.spyOn(global.console,'log').mockReturnValueOnce(null);

    const { status } = await supertest(app).post(`/recommendations/`);

    const recommendation = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    
    expect(status).toEqual(422);
    expect(recommendation).toBeNull();
  });

  it("it should not persist a recommendation if invalid body data and should also return status code 500", async () => {
    jest.spyOn(recommendationSchema,'validate').mockReturnValueOnce(null);
    const { status } = await supertest(app).post(`/recommendations/`);

    const recommendation = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    
    expect(status).toEqual(500);
    expect(recommendation).toBeNull();
  });

  it("tried to force status 400 but it seems impossible", async () => {
    jest.mock('../src/middlewares/errorHandlerMiddleware.js', () => jest.fn((req, res, next) =>
    {
      return res.sendStatus(400);
    }
    ));

    const { status } = await supertest(app).post(`/recommendations/`);

    const recommendation = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    
    expect(status).toEqual(400);
    expect(recommendation).toBeNull();
  });
  
});



describe("POST recommendations/id/upvote", () => {

  beforeEach(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should increase the score of a recommendation, and should return also status 200", async () => {
    const recommendationBody = recommendationBodyFactory(1);
    await recommendationFactory(recommendationBody);
    const { score: scoreBefore } = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    const { status } = await supertest(app).post("/recommendations/1/upvote");
    const { score: scoreAfter } = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });

    expect(status).toEqual(200);
    expect(scoreBefore).not.toBeNull();
    expect(scoreAfter).not.toBeNull();
    expect(scoreAfter).toBeGreaterThan(scoreBefore);
  });

});

describe("POST recommendations/id/downvote", () => {

  beforeEach(truncateRecommendations);
  afterAll(disconnect);
  
  it("it should decrease the score of a recommendation, and should return also status 200", async () => {
    const recommendationBody = recommendationBodyFactory(1);
    await recommendationFactory(recommendationBody);
    const { score: scoreBefore } = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });
    const { status } = await supertest(app).post("/recommendations/1/downvote");
    const { score: scoreAfter } = await prisma.recommendation.findUnique({
      where: {
        id: 1
      }
    });

    expect(status).toEqual(200);
    expect(scoreBefore).not.toBeNull();
    expect(scoreAfter).not.toBeNull();
    expect(scoreBefore).toBeGreaterThan(scoreAfter);
  });

});

async function disconnect() {
  await prisma.$disconnect();
}

async function truncateRecommendations() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY;`;
}

export {
  disconnect,
  truncateRecommendations
}
