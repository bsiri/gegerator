import { OrderByLowercasePipe } from './order-by-lowercase.pipe';

describe('OrderByLowercasePipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByLowercasePipe();
    expect(pipe).toBeTruthy();
  });
});
