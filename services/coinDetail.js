const axios = require('axios');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const path = require('path');

const data = {
  title: 'ten (sub title)',
  images: ['url1', 'url2'],
  obverse: {
    description: '',
    script: '',
    lettering: '',
    translation: '',
  },
  reverse: {
    description: '',
    script: '',
    lettering: '',
    translation: '',
  },
  features: [
    {
      title: 'title',
      value: 'title',
    },
    {
      title: 'title',
      value: 'title',
    },
  ],
};

const readJsonFile = (jsonfile) => {
  const directoryPath = path.join(__dirname, 'jsons');
  const filePath = path.join(directoryPath, jsonfile);
  // const jsonPath = `./jsons/${jsonfile}`;
  const reader = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(reader);
  return data;
};

const writeJsonFile = (jsonfile, item) => {
  const directoryPath = path.join(__dirname, 'jsons');
  const filePath = path.join(directoryPath, jsonfile);
  // const savePath = `./jsons/${jsonfile}`;

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.appendFile(filePath, ',\n' + JSON.stringify(item), function (err) {
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

const convertFormatData = (data) => {
  const resultObject = {};

  for (const item of data) {
    if (item.startsWith('Script:')) {
      resultObject.script = item.trim().replace('Script:\n        ', '');
    } else if (item.startsWith('Lettering:')) {
      resultObject.lettering = item.replace('Lettering:\n                ', '');
    } else if (item.startsWith('Translation:')) {
      resultObject.translation = item.replace(
        'Translation:\n                ',
        ''
      );
    }
  }

  return resultObject;
};

async function crawlCoinDetail(url) {
  try {
    const configURL = {
      method: 'get',
      url: `${url}`,
      headers: {
        authority: 'en.numista.com',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8,en-US;q=0.7',
        'cache-control': 'max-age=0',
        cookie:
          '_pk_id.10.0242=62cc5b1518e355f3.1689129966.; PHPSESSID=5a2pbf27a7qtkkp9c33jp3fpnp; _pk_ses.10.0242=1; PHPSESSID=vhr5o39lu4ds3jqaar47tijkk9',
        'sec-ch-ua':
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    };
    const response = await axios(configURL);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const emptyImage = [
      'https://en.numista.com/catalogue/no-obverse-coin-en.png',
      'https://en.numista.com/catalogue/no-reverse-coin-en.png',
    ];

    const imagesElement = document.querySelector('#fiche_photo');
    const coinsImageElement = imagesElement.querySelectorAll('a img');
    const imageUrl = [];
    coinsImageElement.forEach((item) => {
      const imageUrlValue = item.getAttribute('src');
      if (imageUrlValue === emptyImage[0] && imageUrlValue === emptyImage[1]) {
        return;
      } else {
        imageUrl.push(imageUrlValue);
      }
    });

    if (imageUrl.length <= 0) {
      console.log('No image');
      return;
    } else {
      const mainTitleElement = document.querySelector('#main_title');
      const h1Element = mainTitleElement.querySelector('h1');
      let textContent = '';
      for (const node of h1Element.childNodes) {
        if (node.nodeName !== 'SPAN') {
          textContent += node.textContent;
        }
      }
      const subTitle = mainTitleElement.querySelector('span');
      const tittle = `${textContent}${
        subTitle ? `(${subTitle.textContent})` : ''
      }`;

      const descriptionsElement = document.querySelector('#fiche_descriptions');
      const descTitle = descriptionsElement.querySelectorAll('h3');
      let observe;
      let reserve;
      descTitle.forEach((desc) => {
        if (desc.textContent === 'Obverse') {
          const obverseRes = [];
          let nextSibling = desc.nextElementSibling;
          while (nextSibling) {
            obverseRes.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
          }
          const obverseElements = obverseRes
            .map((el) => el.textContent.trim())
            .filter((value) => value !== '');
          const reverseIndex = obverseElements.indexOf('Reverse');
          const data =
            reverseIndex !== -1
              ? obverseElements.slice(0, reverseIndex)
              : obverseElements;

          const result = convertFormatData(data);
          result.description = data.shift();
          observe = result;
        }

        if (desc.textContent === 'Reverse') {
          const reverseRes = [];
          let nextSibling = desc.nextElementSibling;
          while (nextSibling) {
            reverseRes.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
          }
          const reverseElements = reverseRes
            .map((el) => el.textContent.trim())
            .filter((value) => value !== '');

          const result = convertFormatData(reverseElements);
          result.description = reverseElements.shift();
          reserve = result;
        }
      });

      const tableElement = document.querySelectorAll(
        '#fiche_caracteristiques table tbody tr th'
      );
      const keyFeatures = [];
      tableElement.forEach((tr) =>
        keyFeatures.push({ tittle: tr.textContent })
      );
      const tdElement = document.querySelectorAll(
        '#fiche_caracteristiques table tbody tr td'
      );

      const valueFeatures = [];
      tdElement.forEach((td) => {
        const tdElementValue = td.textContent.trim();
        let pattern = /\s+/g;
        const formatValue = tdElementValue.replace(pattern, ' ');
        const data = {
          value: formatValue || '',
        };
        valueFeatures.push(data);
      });
      valueFeatures.forEach((value, index) => {
        const key = keyFeatures[index];
        Object.assign(key, value);
      });

      const item = {
        tittle,
        images: imageUrl,
        observe,
        reserve,
        features: keyFeatures,
      };

      // const resJsonFile = writeJsonFile('coinDetail.json', item);
      // console.log(item);
      return item;
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { crawlCoinDetail, readJsonFile };
