import { OrderByDateTimePipe } from './order-by-date-time.pipe';

describe('OrderByDateTimePipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByDateTimePipe();
    expect(pipe).toBeTruthy();
  });
});
