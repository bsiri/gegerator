import { OrderByComparablePipe } from './order-by-comparable.pipe';

describe('OrderByComparablePipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByComparablePipe();
    expect(pipe).toBeTruthy();
  });
});
