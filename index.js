const {
  key,
  collectionId,
  openweatherapikey,
  weatherapikey,
} = require("./config.js");
const { Revise } = require("revise-sdk");
const revise = new Revise({ auth: key });
const axios = require("axios");

let nftt = null;
let weather = null;
const sunnycodes = [1000, 1003, 1006];
const rainycodes = [
  1009, 1030, 1063, 1072, 1087, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189,
  1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276,
];

const all = [
  {
    condition: "Neutral",
    image: "https://i.ibb.co/bRmpNVM/Frame-62.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/p3LXdZN/Frame-100.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/hHPMMMK/Frame-61.gif",
  },
  {
    condition: "Neutral",
    image: "https://i.ibb.co/4dXWQhC/Frame-57.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/pjKpGBB/Frame-99.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/2KRymZk/Frame-58.gif",
  },
  {
    condition: "Neutral",
    image: "https://i.ibb.co/2nVHNsh/Frame-97.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/tZgTN0s/Frame-98.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/rm1j0FG/Frame-96.gif",
  },
];

const winter = [
  {
    condition: "Neutral",
    image: "https://i.ibb.co/bRmpNVM/Frame-62.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/p3LXdZN/Frame-100.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/hHPMMMK/Frame-61.gif",
  },
];

const summer = [
  {
    condition: "Neutral",
    image: "https://i.ibb.co/4dXWQhC/Frame-57.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/pjKpGBB/Frame-99.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/2KRymZk/Frame-58.gif",
  },
];

const monsoon = [
  {
    condition: "Neutral",
    image: "https://i.ibb.co/2nVHNsh/Frame-97.gif",
  },
  {
    condition: "Better",
    image: "https://i.ibb.co/tZgTN0s/Frame-98.gif",
  },
  {
    condition: "Worse",
    image: "https://i.ibb.co/rm1j0FG/Frame-96.gif",
  },
];

let targetweather = winter;

async function API() {
  console.log("API called");
  let location = nftt?.nft?.metaData[1]?.location;
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/history.json",
    params: { q: location, dt: "2022-11-06", lang: "en" },
    headers: {
      "X-RapidAPI-Key": weatherapikey,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };
  console.log("Location", location);

  await axios(options)
    .then(async function (response) {
      weather = response?.data?.forecast?.forecastday[0]?.day?.condition?.code;
      if (sunnycodes.includes(weather)) {
        console.log("summer");
        targetweather = summer;
      } else if (rainycodes.includes(weather)) {
        console.log("monsoon");
        targetweather = monsoon;
      } else {
        console.log("winter");
        targetweather = winter;
      }
    })
    .catch(function (error) {
      console.error(error);
    });

  //airquality today

  const todaye = Math.floor(Date.now() / 1000);
  const todays = Math.floor(Date.now() / 1000) - 6000;
  const yesterdays = todays - 86400;
  const yesterdaye = todaye - 86400;
  let todaytot = 0;
  let yesterdaytot = 0;
  console.log("yesterdays", todays, todaye);
  const options2 = {
    method: "GET",
    url: `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=23.2156&lon=72.6369&start=${todays}&end=${todaye}&appid=${openweatherapikey}`,
  };
  await axios(options2)
    .then(async function (res) {
      values = Object.values(res?.data?.list[0].components);
      console.log("today values", values);
      for (let i = 0; i < values.length; i++) {
        if (values[i] > 100) {
          values[i] = values[i] / 10;
        }
        if (values[i] < 100) {
          values[i] = values[i] * 10;
        }
        todaytot += values[i];
      }
    })
    .catch(function (error) {
      // console.error(error);
    });

  const options3 = {
    method: "GET",
    url: `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=23.2156&lon=72.6369&start=${yesterdays}&end=${yesterdaye}&appid=1b2216d0512914356278613cd4ca3857`,
  };

  await axios(options3)
    .then(async function (res) {
      values = Object.values(res?.data?.list[0].components);
      console.log("yesterday values", values);
      for (let i = 0; i < values.length; i++) {
        if (values[i] > 100) {
          values[i] = values[i] / 10;
        }
        if (values[i] < 100) {
          values[i] = values[i] * 10;
        }

        yesterdaytot += values[i];
      }
    })
    .catch(function (error) {
      // console.error(error);
    });

  console.log("todaytot", todaytot);
  console.log("yesterdaytot", yesterdaytot);

  let index = 0;

  if (Math.abs(todaytot - yesterdaytot) < 5) {
    index = 0;
  } else if (todaytot > yesterdaytot) {
    index = 2;
  } else {
    index = 1;
  }
  return targetweather[index];
  // let randomindex = Math.floor(Math.random() * 9);
  // return all[randomindex];
}

async function run() {
  const collection = await revise.addCollection({
    name: "The-Earth",
    uri: "theearth",
  });
  console.log("Collection created", collection);
}

async function add() {
  const res = await revise.addNFT(
    {
      name: "Earth",
      tokenId: "1",
      description:
        "This is not just a mere NFT but is The Earth itself and it has emotions !!! Voila !!! , It will feel sad when the emissions in the linked location increase in comparison to yesterday and happy when less compared to yesterday. Try to keep it happy ALWAYS",
      image: "https://i.ibb.co/4dXWQhC/Frame-57.gif",
    },
    [{ condition: "Neutral" }, { location: "Gandhinagar" }],
    collectionId
  );

  console.log(res);
}

async function update() {
  const res = await revise.fetchNFT("2f04b651-8e14-467a-9806-0197fc7775e2");
  const nft = revise.nft(res);
  nftt = nft;

  // nft.setName("Tommy").save()
  // console.log(res)
  revise
    .every("10s")
    .listenTo(API)
    .start(async (data) => {
      await nft
        .setProperty("condition", data.condition)
        .setImage(data.image)
        .save();

      console.log("condition", data.condition);
    });
}

update();
