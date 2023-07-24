const axios = require("axios");
const fs = require("fs");
const path = require("path");

const readJsonFile = (jsonfile) => {
  const directoryPath = path.join(__dirname, "jsons");
  const filePath = path.join(directoryPath, jsonfile);
  // const jsonPath = `./jsons/${jsonfile}`;
  const reader = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(reader);
  return data;
};

const writeJsonFile = (jsonfile, item) => {
  const directoryPath = path.join(__dirname, "jsons");
  const filePath = path.join(directoryPath, jsonfile);
  // const savePath = `./jsons/${jsonfile}`;

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.appendFile(filePath, ",\n" + JSON.stringify(item), function (err) {
    if (err) {
      console.log(err);
      throw err;
    }
  });
  // const data = JSON.stringify(item);
  // fs.writeFileSync(`./json/${jsonfile}`, data, (err) => {
  //   if (err) throw err;
  //   console.log('Data written to file');
  // });
};

const fetchListCategory = async () => {
  try {
    const configUrl = {
      method: "get",
      url: "https://backend-wallpaper.kika-backend.com/v1/api/theme/page/kbtheme_category?fetch_size=50&offset=0&sign=fb79185fb55e4d0a9e53a53502cb9520",
      headers: {
        host: "backend-wallpaper.kika-backend.com",
        accept: "*/*",
        "user-key": "",
        "user-agent":
          "com.xinmei365.NewEmojiKey/302071631 (FD733327-5777-4951-AA1D-57AEF526B1C5/3b42d2b0834f4d2755e0128b196cb5c4) Country/US Language/en System/iOS Version/16.3.1 Screen/480",
        connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios(configUrl);
    const categories = response.data.data;
    const listCategory = [];
    categories.sections.forEach((category) => {
      const item = {
        title: category.title,
        key: category.key,
      };
      listCategory.push(item);
    });
    const result = {
      title: categories.title,
      sections: listCategory,
    };

    return result;
  } catch (error) {
    console.log(error);
  }
};

const fetchItemByCategory = async (categoryKey) => {
  try {
    const configUrl = {
      method: "get",
      url: `https://backend-wallpaper.kika-backend.com/v1/api/theme/category/${categoryKey}/resources?sign=fb79185fb55e4d0a9e53a53502cb9520`,
      headers: {
        host: "backend-wallpaper.kika-backend.com",
        accept: "*/*",
        "user-key": "",
        "user-agent":
          "com.xinmei365.NewEmojiKey/302071631 (FD733327-5777-4951-AA1D-57AEF526B1C5/3b42d2b0834f4d2755e0128b196cb5c4) Country/US Language/en System/iOS Version/16.3.1 Screen/480",
        connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios(configUrl);
    const items = response.data.data;
    return items;
  } catch (error) {
    console.log(error);
  }
};

const fetchItemDetail = async (itemKey) => {
  try {
    const configUrl = {
      method: "get",
      url: `https://backend-wallpaper.kika-backend.com/v1/api/theme/resource/${itemKey}?sign=fb79185fb55e4d0a9e53a53502cb9520`,
      headers: {
        host: "backend-wallpaper.kika-backend.com",
        accept: "*/*",
        "user-key": "",
        "user-agent":
          "com.xinmei365.NewEmojiKey/302071631 (FD733327-5777-4951-AA1D-57AEF526B1C5/3b42d2b0834f4d2755e0128b196cb5c4) Country/US Language/en System/iOS Version/16.3.1 Screen/480",
        connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios(configUrl);
    const itemDetail = response.data.data;
    return itemDetail;
  } catch (error) {
    console.log(error);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const crawlKikaItem = async () => {
  try {
    const categories = await fetchListCategory();
    console.log(categories);

    const listItem = await Promise.all(
      categories.sections.map(async (category) => {
        const data = await fetchItemByCategory(category.key);
        const itemInListCategory = data.sections[0].items.map((item) => ({
          title: item.title,
          key: item.key,
        }));
        return {
          category_name: data.title,
          items: itemInListCategory,
        };
      })
    );
    // console.log(listItem);
    // console.log(listItem.length);

    // const listKeyItem = [];
    // listItem.map((item) => {
    //   console.log(item);
    //   const listKey = [];
    //   item.items.map((value) => {
    //     const keyItem = value.key;
    //     listKey.push({ key: keyItem });
    //   });
    //   const result = {
    //     category: item.category_name,
    //     sections: listKey,
    //   };
    //   listKeyItem.push(result);
    // });
    // console.log(listKeyItem);
    // console.log(listKeyItem.length);

    // let itemAmount = 0;
    // const itemDetails = [];
    // const keyArr = listKeyItem.sections.map((section) => {
    //   section;
    // });
    // for (const item of keyArr) {
    //   const data = await fetchItemDetail(item.key);
    //   console.log("\nadd item to list: ", itemAmount);
    //   console.log(data.item.title);
    //   itemAmount++;
    //   itemDetails.push(data.item);
    //   await delay(10);
    // }
    // console.log("------------------------------");
    // console.log(">>>Items: ", itemAmount);
    // console.log(itemDetails.length);
    // writeJsonFile("items-list-final.json", itemDetails);
    // console.log("final");
    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { crawlKikaItem, readJsonFile };
