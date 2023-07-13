const express = require('express');
const axios = require('axios');
const jsdom = require('jsdom');
const router = express.Router();
const { JSDOM } = jsdom;

router.get('/', async function (req, res, next) {
  try {
    const configURL = {
      method: 'get',
      url: 'https://en.numista.com/catalogue/pieces93992.html',
      headers: {
        authority: 'en.numista.com',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en,vi-VN;q=0.9,vi;q=0.8,en-US;q=0.7',
        'cache-control': 'max-age=0',
        cookie:
          'PHPSESSID=vteuge233dm95uolqfihdbgmma; _pk_id.10.0242=62cc5b1518e355f3.1689129966.; _pk_ses.10.0242=1; PHPSESSID=0h47tueacnoh45pc9bc2mik97a',
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

    const mainTitleElement = document.querySelector('#main_title');
    const h1Element = mainTitleElement.querySelector('h1');
    let textContent = '';
    for (const node of h1Element.childNodes) {
      if (node.nodeName !== 'SPAN') {
        textContent += node.textContent;
      }
    }
    const subTitle = mainTitleElement.querySelector('span');
    const tittle = {
      mainTitle: textContent,
      subTitle: subTitle.textContent,
    };

    const imagesElement = document.querySelector('#fiche_photo');
    const coinsImageElement = imagesElement.querySelectorAll('a img');
    const imageUrl = [];
    coinsImageElement.forEach((item) => {
      imageUrl.push(item.getAttribute('src'));
    });
    const bank = imagesElement.querySelector('.mentions');
    const bankURL = bank.querySelector('a').getAttribute('href');
    const images = {
      url: imageUrl,
      bank: {
        name: bank.textContent,
        bankURL: bankURL,
      },
    };

    const tableElement = document.querySelectorAll(
      '#fiche_caracteristiques table tbody tr th'
    );
    const keyFeatures = [];
    tableElement.forEach((tr) => keyFeatures.push({ tittle: tr.textContent }));
    const tdElement = document.querySelectorAll(
      '#fiche_caracteristiques table tbody tr td'
    );

    const valueFeatures = [];
    tdElement.forEach((td) => {
      const value = td.querySelector('img');
      const objs = {
        name: td.textContent,
        imgUrl: value?.getAttribute('src'),
      };
      valueFeatures.push(objs);
    });
    valueFeatures.forEach((obj, index) => {
      const obj1 = keyFeatures[index];
      Object.assign(obj1, obj);
    });

    // const descriptionsElement = document.querySelector('#fiche_descriptions');
    // const descTitle = descriptionsElement.querySelectorAll('h3');
    // descTitle.forEach((desc) => console.log(desc.textContent));
    // console.log(descTitle.textContent);

    const result = {
      tittle,
      images,
      features: keyFeatures,
    };
    res.json({ data: result });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
