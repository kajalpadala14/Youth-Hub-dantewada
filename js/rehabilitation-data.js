/**
 * Rehabilitation Counselling Beneficiary Dataset
 * District Administration, Dantewada
 * 52 Beneficiary Records from Excel
 */
(function(scope) {
  const records = [
  {
    "id": 1,
    "name": "FANAS",
    "address": "NAGFAMI",
    "mobile": "9399438895",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 2,
    "name": "BASANTI NAG",
    "address": "BINJAM",
    "mobile": "9329780681",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 3,
    "name": "ANJALI YADAV",
    "address": "FARASPAL",
    "mobile": "9770761619",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 4,
    "name": "NILAM",
    "address": "GUMDA",
    "mobile": "8815828616",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 5,
    "name": "CHATRAPAL",
    "address": "KARLI",
    "mobile": "9098709852",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 6,
    "name": "SANTOSHI THAKUR",
    "address": "FARASPAL",
    "mobile": "8815791919",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 7,
    "name": "AJANTI KASHYA",
    "address": "SIYANAR",
    "mobile": "9340767048",
    "institute": "LIVELIHOOD",
    "training": "computer operator",
    "block": "Dantewada"
  },
  {
    "id": 8,
    "name": "ATUL DENGAL",
    "address": "BADETUMNAR",
    "mobile": "9406436769",
    "institute": "",
    "training": "",
    "block": "Dantewada"
  },
  {
    "id": 9,
    "name": "NILIMA BAGHEL",
    "address": "MUSTALNAR",
    "mobile": "9098552995",
    "institute": "",
    "training": "BEAUTIPARLOR",
    "block": "Dantewada"
  },
  {
    "id": 10,
    "name": "RITA KASHYAP",
    "address": "HIRANAR",
    "mobile": "7067907694",
    "institute": "",
    "training": "BEAUTIPARLOR",
    "block": "Dantewada"
  },
  {
    "id": 11,
    "name": "LAXMI BHASKAR",
    "address": "KASOL",
    "mobile": "8817632251",
    "institute": "",
    "training": "BEAUTIPARLOR",
    "block": "Dantewada"
  },
  {
    "id": 12,
    "name": "KANAKLATA YADAV",
    "address": "KARLI",
    "mobile": "6268019044",
    "institute": "",
    "training": "FASION DESING",
    "block": "Dantewada"
  },
  {
    "id": 13,
    "name": "SHIVNATH",
    "address": "HIRANAR",
    "mobile": "9202578040",
    "institute": "",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 14,
    "name": "LALITA POYAMI",
    "address": "BADEPANEDA",
    "mobile": "7725072262",
    "institute": "",
    "training": "FASION DESING",
    "block": "Dantewada"
  },
  {
    "id": 15,
    "name": "DINESH",
    "address": "MUNDER",
    "mobile": "6266119947",
    "institute": "",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 16,
    "name": "SANJAY YADAV",
    "address": "BADESUROKHI",
    "mobile": "9301834154",
    "institute": "",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 17,
    "name": "RUPESH NAG",
    "address": "CHINDNAR",
    "mobile": "8817553022",
    "institute": "",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 18,
    "name": "PREMLAL YADAV",
    "address": "KARLI",
    "mobile": "9340821544",
    "institute": "",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 19,
    "name": "CHANDANI",
    "address": "CHODIYABADAM",
    "mobile": "8319781868",
    "institute": "",
    "training": "FASION DESING",
    "block": "Dantewada"
  },
  {
    "id": 20,
    "name": "DEEPAK BHASKAR",
    "address": "CHOTETUMNAR",
    "mobile": "9201126448",
    "institute": "",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 21,
    "name": "MAHENDRA KAWASI",
    "address": "NAGUL",
    "mobile": "9301665054",
    "institute": "",
    "training": "PLUMBING",
    "block": "Dantewada"
  },
  {
    "id": 22,
    "name": "CHAMAN YADAV",
    "address": "CHINDNAR",
    "mobile": "8839527064",
    "institute": "",
    "training": "PLUMBING",
    "block": "Dantewada"
  },
  {
    "id": 23,
    "name": "HIMESHWARI",
    "address": "FARASPAL",
    "mobile": "6266524550",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 24,
    "name": "MAINI KASHYAP",
    "address": "CHODIYABADAM",
    "mobile": "9131377091",
    "institute": "",
    "training": "FASION DESING",
    "block": "Dantewada"
  },
  {
    "id": 25,
    "name": "NILAM",
    "address": "GUMDA",
    "mobile": "8815828616",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 26,
    "name": "BABITA NAG",
    "address": "BINJAM",
    "mobile": "9329780681",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 27,
    "name": "SAVITRI",
    "address": "GUMLNAR",
    "mobile": "9201739123",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 28,
    "name": "ASIFA",
    "address": "GEEDAM",
    "mobile": "9406270032",
    "institute": "",
    "training": "FASION DESING",
    "block": "Geedam"
  },
  {
    "id": 29,
    "name": "SUNDERLAL",
    "address": "GUMALNAR",
    "mobile": "6267059976",
    "institute": "",
    "training": "PLUMBING",
    "block": "Dantewada"
  },
  {
    "id": 30,
    "name": "MADAN KUMAR",
    "address": "FARASPAL",
    "mobile": "8815978579",
    "institute": "",
    "training": "PLUMBING",
    "block": "Dantewada"
  },
  {
    "id": 31,
    "name": "RINA KASHYAP",
    "address": "UPET",
    "mobile": "8815943563",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 32,
    "name": "GEETA NAG",
    "address": "MUCHNAR",
    "mobile": "6266471075",
    "institute": "",
    "training": "FASION DESING",
    "block": "Dantewada"
  },
  {
    "id": 33,
    "name": "JAGDISH NETAM",
    "address": "JODATARAI",
    "mobile": "8839098917",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 34,
    "name": "POOJA ANDRIK",
    "address": "BARSOOR",
    "mobile": "7723912165",
    "institute": "",
    "training": "COMPUTER",
    "block": "Dantewada"
  },
  {
    "id": 35,
    "name": "PUSHPENDRA",
    "address": "HIRANAR",
    "mobile": "8103183031",
    "institute": "RSETI",
    "training": "BIKE REPAIR",
    "block": "Dantewada"
  },
  {
    "id": 36,
    "name": "RAVI KUMAR",
    "address": "BADEKARLI",
    "mobile": "9399976281",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 37,
    "name": "RAMLAL BARSE",
    "address": "BADEKARLI",
    "mobile": "6267470684",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 38,
    "name": "ROSHNI",
    "address": "SIYANAR",
    "mobile": "626811414",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 39,
    "name": "SARITA BHASKAR",
    "address": "SAMLOOR",
    "mobile": "8305764395",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 40,
    "name": "TOPESHWARI",
    "address": "GEEDAM",
    "mobile": "9691774884",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Geedam"
  },
  {
    "id": 41,
    "name": "RICHA SARKAR",
    "address": "GEEDAM",
    "mobile": "9399050553",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Geedam"
  },
  {
    "id": 42,
    "name": "PRITI MANDAVI",
    "address": "BADEPANEDA",
    "mobile": "9340967252",
    "institute": "RSETI",
    "training": "DRIVING",
    "block": "Dantewada"
  },
  {
    "id": 43,
    "name": "PRATIMA KADTI",
    "address": "KAURGAON",
    "mobile": "7601068441",
    "institute": "MTC SUKMA",
    "training": "HOTEL MANAGEMENT",
    "block": "Dantewada"
  },
  {
    "id": 44,
    "name": "RADMA KADTI",
    "address": "KAURGAON",
    "mobile": "9243853771",
    "institute": "MTC SUKMA",
    "training": "HOTEL MANAGEMENT",
    "block": "Dantewada"
  },
  {
    "id": 45,
    "name": "MAITRI",
    "address": "KAURGAON",
    "mobile": "8817272775",
    "institute": "MTC SUKMA",
    "training": "HOTEL MANAGEMENT",
    "block": "Dantewada"
  },
  {
    "id": 46,
    "name": "JOGI KASHYAP",
    "address": "CHERPAL",
    "mobile": "7723096225",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 47,
    "name": "VISHNU MANDAVI",
    "address": "REKA",
    "mobile": "6268275896",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 48,
    "name": "RAJMAN PODIYAMI",
    "address": "REKA",
    "mobile": "9301212702",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 49,
    "name": "CHAITURAM",
    "address": "REKA",
    "mobile": "7000478837",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 50,
    "name": "SHIVRAM VETTI",
    "address": "KUNDENAR",
    "mobile": "6260789613",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 51,
    "name": "MITTU RAM",
    "address": "KUNDENAR",
    "mobile": "8815810704",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  },
  {
    "id": 52,
    "name": "KIRSU VETTI",
    "address": "KUNDENAR",
    "mobile": "7828879161",
    "institute": "MTC SUKMA",
    "training": "ELECTRICIAN",
    "block": "Dantewada"
  }
];
  if (scope) {
    scope.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof window !== 'undefined') {
    window.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof global !== 'undefined') {
    global.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = records;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
