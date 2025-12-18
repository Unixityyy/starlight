// yt image urls are https://i.ytimg.com/vi/<video id>/hq720.jpg

window.STARLIGHT_SONGS = [
  {
    id: 1,
    title: "Big Poe",
    artist: "Tyler, The Creator (ft. Sk8brd)",
    cover: "https://i.ytimg.com/vi/OKVi6jPdE8c/hq720.jpg",
    file: "./songs/Big Poe.m4a",
    isExplicit: true
  },
  {
    id: 2,
    title: "Doomsday",
    artist: "MF Doom",
    cover: "https://i.ytimg.com/vi/5TlZeem3FU8/hq720.jpg",
    file: "./songs/Doomsday.m4a",
    isExplicit: false
  },
  {
    id: 3,
    title: "World's Smallest Violin",
    artist: "AJR",
    cover: "https://i.ytimg.com/vi/MiKkH48P8g8/hq720.jpg",
    file: "./songs/World's Smallest Violin.m4a",
    isExplicit: true
  },
  {
    id: 4,
    title: "SICKO MODE",
    artist: "Travis Scott",
    cover: "https://i.ytimg.com/vi/d-JBBNg8YKs/hq720.jpg",
    file: "./songs/SICKO MODE.m4a",
    isExplicit: true
  },
  {
    id: 5,
    title: "Wish",
    artist: "Diplo (ft. Trippie Redd)",
    cover: "https://i.ytimg.com/vi/ZpQAwGHI29A/hq720.jpg",
    file: "./songs/Wish.m4a",
    isExplicit: true
  },
  {
    id: 6,
    title: "Loonboon",
    artist: "supershigi",
    cover: "https://i.ytimg.com/vi/lr4vi_XAjQQ/hq720.jpg",
    file: "./songs/Loonboon.m4a",
    isExplicit: false
  },
  {
    id: 7,
    title: "Thrift Shop",
    artist: "Macklemore & Ryan Lewis (ft. Wanz)",
    cover: "https://i.ytimg.com/vi/apIzD5lgmp0/hq720.jpg",
    file: "./songs/Thrift Shop.m4a",
    isExplicit: true
  },
  {
    id: 8,
    title: "What It Sounds Like",
    artist: "HUNTR/X",
    cover: "https://i.ytimg.com/vi/rkYuufTXkL8/hq720.jpg",
    file: "./songs/What It Sounds Like.m4a",
    isExplicit: false
  },
  {
    id: 9,
    title: "H*e Cakes",
    artist: "MF Doom",
    cover: "https://i.ytimg.com/vi/GZAXE3-srfM/hqdefault.jpg", // only exception. there was no hq720 for this song.
    file: "./songs/Hoe Cakes.m4a",
    isExplicit: true
  },
];

(() => {
  const today = new Date();
  const isAprilFools =
    today.getMonth() === 3 && today.getDate() === 1; // 3 = april, 1 = 1st, april fools day

  if (isAprilFools) {
    window.STARLIGHT_SONGS = [
      {
        id: 1,
        title: "Baby Shark",
        artist: "Pinkfong",
        cover: "https://i.ytimg.com/vi/XqZsoesa55w/hq720.jpg",
        file: "./songs/Baby Shark.m4a",
        isExplicit: false
      }
    ];
  }

})();