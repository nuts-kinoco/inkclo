const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');

async function test() {
  const imageName = `Wst_Blaster_Middle_00.png`;
  const url2 = `https://raw.githubusercontent.com/Leanny/splat3/main/images/weapon/${imageName}`;
  try {
    const res2 = await axios({
      url: url2,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Inkclo-App' },
    });
    console.log("Downloaded, size:", res2.data.length);
    await sharp(res2.data).resize(256, 256).png().toFile('test_blaster.png');
    console.log("Saved test_blaster.png");
  } catch (e) {
    console.error("Error:", e.message);
    if (e.response) console.error(e.response.status);
  }
}

test();
