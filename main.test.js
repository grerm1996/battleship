const spaceInvalid = require('./main');

test('ship cant go over board edge', () => {
    expect(spaceInvalid(4, 7, 3)).toBe(true)
});

test('not over board edge is ok', () => {
    expect(spaceInvalid(4, 4, 3)).toBe(false)
});

