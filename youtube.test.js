/*
eslint-disable
*/
const { isYTURL } = require("./youtube.js");

describe("isYTURL", () => {
  describe("URL is passed", () => {
    it("should return true", () => {
      const result = isYTURL("https://www.youtube.com/watch?v=MZ924VGx5n0");
      expect(result).toBe(true);
    });
  });
  describe("String is passed", () => {
    it("should return false", () => {
      const result = isYTURL("FBZ - MRAZ");
      expect(result).toBe(false);
    });
  });
});
