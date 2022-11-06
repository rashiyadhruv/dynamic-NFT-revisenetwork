const { key, collectionId } = require("./config.js");
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

const winter = [
  {
    condition: "Neutral",
    image: "https://mjeksiaislame.com/wp-content/uploads/2022/04/aktrim.jpg",
  },
  {
    condition: "Better",
    image:
      "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg?w=2000",
  },
  {
    condition: "Worse",
    image:
      "https://files.worldwildlife.org/wwfcmsprod/images/Stormy_sunrise_over_the_Badlands/magazine_hero/9jerns69ib_tevin_trinh_xzPSjPdRcC0_unsplash.jpg",
  },
];

const summer = [
  {
    condition: "Neutral",
    image: "https://mjeksiaislame.com/wp-content/uploads/2022/04/aktrim.jpg",
  },
  {
    condition: "Better",
    image:
      "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg?w=2000",
  },
  {
    condition: "Worse",
    image:
      "https://files.worldwildlife.org/wwfcmsprod/images/Stormy_sunrise_over_the_Badlands/magazine_hero/9jerns69ib_tevin_trinh_xzPSjPdRcC0_unsplash.jpg",
  },
];

const monsoon = [
  {
    condition: "Neutral",
    image: "https://mjeksiaislame.com/wp-content/uploads/2022/04/aktrim.jpg",
  },
  {
    condition: "Better",
    image:
      "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg?w=2000",
  },
  {
    condition: "Worse",
    image:
      "https://files.worldwildlife.org/wwfcmsprod/images/Stormy_sunrise_over_the_Badlands/magazine_hero/9jerns69ib_tevin_trinh_xzPSjPdRcC0_unsplash.jpg",
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
      "X-RapidAPI-Key": "a6035ffd3emsh9df388f8b3b4414p19f3f6jsnb2e90f295d22",
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
    url: `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=23.2156&lon=72.6369&start=${todays}&end=${todaye}&appid=1b2216d0512914356278613cd4ca3857`,
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
}

async function run() {
  const collection = await revise.addCollection({
    name: "The Earthquake",
    uri: "the-earthq",
  });
  console.log("Collection created", collection);
}

async function add() {
  const res = await revise.addNFT(
    {
      name: "The Earth 3",
      tokenId: "1",
      description: "Change in weather",
      image:
        "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg",
    },
    [{ condition: "neutral" }, { location: "Gandhinagar" }],
    "db646ee0-d220-4555-9799-ad848a40ffb2"
  );

  console.log(res);
}

async function update() {
  const res = await revise.fetchNFT("2d1595f9-4d8e-46e7-b243-81b42083f02f");
  const nft = revise.nft(res);
  nftt = nft;

  // nft.setName("Tommy").save()
  // console.log(res)
  revise
    .every("10s")
    .listenTo(API)
    .start(async (data) => {
      await nft.setProperty("mood", data.condition).setImage(data.image).save();

      console.log("Mood", data.condition);
    });
}

update();
