import { exactCount } from "src/modules/regex/builtin/exact_count";

describe("Exact count builtin validation", () => {
    it('returns true when input matches exactly the number of expected', async() =>{
        expect(exactCount([1, 2, 3], 3).result).toBeTruthy();
    })

    it('returns false when list length is not as expected', async() => {
        expect(exactCount([1, 2, 3], 2).result).toBeFalsy();
    })
})