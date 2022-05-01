import { OrderByRatingPipe } from './order-by-rating.pipe';

describe('OrderByRatingPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByRatingPipe();
    expect(pipe).toBeTruthy();
  });
});
