// yt image urls are https://i.ytimg.com/vi/<video id>/hq720.jpg

window.STARLIGHT_SONGS = [
  {
    id: 1,
    title: "Big Poe",
    artist: "Tyler, The Creator (ft. Sk8brd)",
    cover: "https://i.ytimg.com/vi/OKVi6jPdE8c/hq720.jpg",
    file: "./songs/Big Poe.m4a",
    file_clean: "./songs/Big Poe Clean.m4a",
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
    file_clean: "./songs/Worlds Smallest Violin Clean.m4a",
    isExplicit: true
  },
  {
    id: 4,
    title: "SICKO MODE",
    artist: "Travis Scott",
    cover: "https://i.ytimg.com/vi/d-JBBNg8YKs/hq720.jpg", // also what is this thumbnail (╥﹏╥)
    file: "./songs/SICKO MODE.m4a",
    file_clean: "./songs/SICKO MODE Clean.m4a",
    isExplicit: true
  },
  {
    id: 5,
    title: "Wish",
    artist: "Diplo (ft. Trippie Redd)",
    cover: "https://i.ytimg.com/vi/ZpQAwGHI29A/hq720.jpg",
    file: "./songs/Wish.m4a",
    file_clean: "./songs/Wish Clean.m4a",
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
    file_clean: "./songs/Thrift Shop Clean.m4a",
    isExplicit: true
  },
  {
    id: 8,
    title: "What It Sounds Like",
    artist: "HUNTR/X",
    cover: "https://i.ytimg.com/vi/nXg0WUHAXMk/hq720.jpg",
    file: "./songs/What It Sounds Like.m4a",
    isExplicit: false
  },
  {
    id: 9,
    title: "you broke me first",
    artist: "Tate McRae",
    cover: "./songs/you broke me first.png", // there was no good youtube cover for this song :\
    file: "./songs/you broke me first.m4a",
    file_clean: "./songs/you broke me first Clean.m4a",
    isExplicit: true
  },
  {
    id: 10,
    title: "H*e Cakes",
    artist: "MF Doom",
    cover: "https://i.ytimg.com/vi/GZAXE3-srfM/hqdefault.jpg", // only exception. there was no hq720 for this song. // well guess what. we have another exception :)
    file: "./songs/Hoe Cakes.m4a",
    file_clean: "./songs/Hoe Cakes Clean.m4a",
    isExplicit: true
  },
  {
    id: 11,
    title: "Payphone",
    artist: "Maroon 5",
    cover: "https://i.ytimg.com/vi/8UY5BGFLtK0/hq720.jpg",
    file: "./songs/Payphone.m4a",
    file_clean: "./songs/Payphone Clean.m4a",
    isExplicit: true
  },
  {
    id: 12,
    title: "Black Knife",
    artist: "Toby Fox",
    cover: "https://i.ytimg.com/vi/B8Us0DZgexw/hq720.jpg",
    file: "./songs/Black Knife.m4a",
    isExplicit: false
  },
  {
    id: 13,
    title: "67 Merry Rizzmas",
    artist: "Goji Georgie",
    cover: "https://i.ytimg.com/vi/xVIEfn3yumw/hq720.jpg",
    file: "./songs/67 Merry Rizzmas.m4a",
    isExplicit: false
  },
  {
    id: 14,
    title: "Shiawase",
    artist: "Dion Timmer",
    cover: "https://i.ytimg.com/vi/suisIF4hwyw/hq720.jpg",
    file: "./songs/Shiawase.m4a",
    isExplicit: false
  },
  {
    id: 15,
    title: "This Side Of Paradise",
    artist: "Coyote Theory",
    cover: "https://i.ytimg.com/vi/TfRWFei-rbk/hq720.jpg",
    file: "./songs/This Side Of Paradise.m4a",
    isExplicit: false
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