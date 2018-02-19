import { UID } from './uid';

class Test1 {
}

class Test2 {
}

class Test3 {
}

class Test4 {
}

describe('UID', () => {
  it('should generate unique class IDs', () => {
    expect(UID(Test1)).toBe(1);
    expect(UID(Test2)).toBe(2);
    expect(UID(Test3)).toBe(3);
    expect(UID(Test2)).toBe(2);
    expect(UID(Test1)).toBe(1);
    expect(UID(Test4)).toBe(4);
  });
});
