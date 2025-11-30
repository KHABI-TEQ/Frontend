/** @format */

export const dummyLocationData = {
  Lagos: {
    lgas: [
      "Alimosho",
      "Ajeromi-Ifelodun",
      "Kosofe",
      "Mushin",
      "Oshodi-Isolo",
      "Ojo",
      "Ikorodu",
      "Surulere",
      "Agege",
      "Ifako-Ijaiye",
      "Somolu",
      "Amuwo-Odofin",
      "Lagos Mainland",
      "Ikeja",
      "Eti-Osa",
      "Badagry",
      "Lagos Island",
      "Apapa",
      "Epe",
      "Ibeju-Lekki",
    ],
    areas: {
      Alimosho: ["Ikotun", "Egbeda", "Idimu", "Igando", "Akowonjo"],
      "Ajeromi-Ifelodun": ["Ajegunle", "Kirikiri", "Boundary"],
      Kosofe: ["Kosofe", "Ikosi", "Agboyi", "Ketu"],
      Mushin: ["Mushin", "Idi-Oro", "Ojuwoye", "Fadeyi"],
      "Oshodi-Isolo": ["Oshodi", "Isolo", "Ejigbo", "Okota"],
      Ojo: ["Ojo", "Alaba", "Igbede", "Ajangbadi"],
      Ikorodu: ["Ikorodu", "Sagamu Road", "Igbogbo", "Bayeku"],
      Surulere: ["Surulere", "Yaba", "Iponri", "Ojuelegba"],
      Agege: ["Agege", "Ogba", "Orile", "Dopemu"],
      "Ifako-Ijaiye": ["Ifako", "Ijaiye", "Fagba", "Abule-Egba"],
      Somolu: ["Somolu", "Bariga", "Akoka", "Onipanu"],
      "Amuwo-Odofin": ["Amuwo-Odofin", "Festac", "Mile 2", "Orile"],
      "Lagos Mainland": ["Lagos Mainland", "Ebute-Metta", "Oyingbo"],
      Ikeja: ["Ikeja", "GRA", "Allen", "Oregun", "Omole"],
      "Eti-Osa": ["Victoria Island", "Ikoyi", "Lekki", "Ajah", "Oniru"],
      Badagry: ["Badagry", "Seme", "Ajido", "Olorunda"],
      "Lagos Island": ["Lagos Island", "Marina", "Broad Street"],
      Apapa: ["Apapa", "Ijora", "Tincan"],
      Epe: ["Epe", "Noforija", "Orimedu"],
      "Ibeju-Lekki": ["Ibeju-Lekki", "Awoyaya", "Sangotedo", "Lakowe"],
    },
  },
  Abuja: {
    lgas: [
      "Abaji",
      "Bwari",
      "Gwagwalada",
      "Kuje",
      "Kwali",
      "Municipal Area Council",
    ],
    areas: {
      Abaji: ["Abaji", "Yaba", "Pandogari"],
      Bwari: ["Bwari", "Kubwa", "Dutse", "Zuba"],
      Gwagwalada: ["Gwagwalada", "Dobi", "Paiko"],
      Kuje: ["Kuje", "Chibiri", "Gwargwada"],
      Kwali: ["Kwali", "Kilankwa", "Yangoji"],
      "Municipal Area Council": [
        "Garki",
        "Wuse",
        "Maitama",
        "Asokoro",
        "Guzape",
        "Jahi",
        "Utako",
        "Lokogoma",
      ],
    },
  },
  Ogun: {
    lgas: [
      "Abeokuta North",
      "Abeokuta South",
      "Ado-Odo/Ota",
      "Ewekoro",
      "Ifo",
      "Ijebu East",
      "Ijebu North",
      "Ijebu North East",
      "Ijebu Ode",
      "Ikenne",
      "Imeko Afon",
      "Ipokia",
      "Obafemi Owode",
      "Odeda",
      "Odogbolu",
      "Ogun Waterside",
      "Remo North",
      "Sagamu",
      "Yewa North",
      "Yewa South",
    ],
    areas: {
      "Abeokuta North": ["Abeokuta North", "Iberekodo", "Kotopo"],
      "Abeokuta South": ["Abeokuta South", "Ake", "Adatan"],
      "Ado-Odo/Ota": ["Ota", "Sango", "Canaan Land", "Toll Gate"],
      Ifo: ["Ifo", "Magboro", "Arepo", "Mowe"],
      Sagamu: ["Sagamu", "Makun", "Simawa", "Km 46"],
      "Obafemi Owode": ["Owode", "Redemption Camp", "Mowe-Ofada"],
    },
  },
};

export const getAllStates = () => {
  return Object.keys(dummyLocationData);
};

export const getLGAs = (state: string) => {
  return dummyLocationData[state as keyof typeof dummyLocationData]?.lgas || [];
};

export const getAreas = (state: string, lga: string) => {
  const stateData = dummyLocationData[state as keyof typeof dummyLocationData];
  return stateData?.areas[lga as keyof typeof stateData.areas] || [];
};
