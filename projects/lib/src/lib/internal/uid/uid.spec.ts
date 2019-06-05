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
    const uid1 = UID(Test1);
    const uid2 = UID(Test2);
    const uid3 = UID(Test3);
    const uid4 = UID(Test4);

    expect(uid1).not.toBe(uid2);
    expect(uid1).not.toBe(uid3);
    expect(uid1).not.toBe(uid4);

    expect(uid2).not.toBe(uid3);
    expect(uid2).not.toBe(uid4);

    expect(uid3).not.toBe(uid4);
  });
});
