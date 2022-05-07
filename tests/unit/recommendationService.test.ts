import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationBodyFactory, recommendationBodyFactoryFull } from "../factories/recommendationBodyFactory";

describe("Recommendation service unit tests", () => {

    beforeEach(() => {
        jest.clearAllMocks()
    });

    it('should attempt to remove a recommendation if its score is less than -5', async () => {
        const recommendation = recommendationBodyFactory(1)[0];
        jest.spyOn(recommendationRepository, "find")
        .mockResolvedValue({...recommendation, score: -6});
        const recommendationRepositoryRemove = jest.spyOn(recommendationRepository, "remove");
        await recommendationService.downvote(1);
        expect(recommendationRepositoryRemove).toBeCalledTimes(1);
    });

    it('should be ok', async () => {

        jest.spyOn(global.Math, 'random').mockReturnValue(1);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue(recommendationBodyFactoryFull(3));
        const data = await recommendationService.getRandom();
        expect(data);
    });

    it('should throw an error of type not found while trying to get a random recommendation when there are no recommendations stored', async () => {

        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue([]);
        await expect(recommendationService.getRandom()).rejects.toEqual({"message": "", "type": "not_found"});
        
    });

    
    
    it('should throw an error of type not found while trying to upvote an inexistent recommendation', async () => {
        
        jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null);
          const recommendationFactoryUpdateScore = jest.spyOn(recommendationRepository, 'updateScore');
          await expect(recommendationService.downvote(1)).rejects.toEqual({"message": "", "type": "not_found"});
          expect(recommendationFactoryUpdateScore).not.toBeCalled();
         
    });

    it('should throw an error of type not found while trying to downvote an inexistent recommendation', async () => {
        
        jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null);
        const recommendationFactoryUpdateScore = jest.spyOn(recommendationRepository, 'updateScore');
        await expect(recommendationService.upvote(1)).rejects.toEqual({"message": "", "type": "not_found"});
        expect(recommendationFactoryUpdateScore).not.toBeCalled();
          
    });
});

