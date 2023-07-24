var express = require("express");
var router = express.Router();
const KikaService = require("../services/crawl.kika");

/* GET home page. */
router.get("/", function (req, res, next) {
  const crawlList = KikaService.crawlKikaItem();
  // res.render("index", { title: "Express" });
  res.send("oke");
});

module.exports = router;
