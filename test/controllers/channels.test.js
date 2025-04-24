const channels = require("../../controllers/chainesController");

describe("Competence Controller", () => {
  let req;
  let res;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });
  describe("getChannels", () => {
    it("Devrait renvoyer un liste et un status 200", async () => {
      req.body = {
        start: 0,
        length: 5,
        search: "",
        sortCategory: null,
        sortOrder: "ASC",
        subscribers: "",
      };
      await channels.getChannels(req, res);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toBeInstanceOf(Array);
      expect(responseData.length).toBeLessThanOrEqual(5);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
