// GTA Wiki image proxy - uses EN wiki pageimages API (returns infobox image = always correct angle + GTA V)
// Only uses direct filename for vehicles without pageimages thumbnails

const imageCache = new Map();

// Wiki page title overrides for vehicles with disambiguation pages
// Format: "Vehicle Name in App" → "Exact Wiki Page Title"
const wikiPageTitles = {
  // Disambiguation pages (HD Universe = GTA V/Online)
  "Sultan": "Sultan (HD Universe)",
  "Banshee": "Banshee 900R",  // Banshee HD Universe has GTA VI image, use 900R for GTA V
  "Mesa": "Mesa (HD Universe)",
  "Taxi": "Taxi (HD Universe)",
  "Alpha": "Alpha (HD Universe)",
  "Greenwood": "Greenwood (HD Universe)",
  "Ambulance": "Ambulance (HD Universe)",
  "Bus": "Bus (HD Universe)",
  "Fire Truck": "Fire Truck (HD Universe)",
  "Scarab": "Apocalypse Scarab",
  "Police Interceptor": "Police Cruiser (interceptor)",

  // Vehicles with different wiki page names
  "Rat Loader": "Rat-Loader",
  "Kanjo": "Kanjo SJ",
  "Lazer": "P-996 LAZER",
  "Alkonost": "RO-86 Alkonost",
  "Kurtz 31": "Kurtz 31 Patrol Boat",
  "Towtruck": "Tow Truck",
  "Merryweather Mesa": "Merryweather Mesa",
  "Police Roadcruiser": "Police Cruiser (interceptor)",

  // Compound names that need specific wiki page
  "9F": "9F",
  "9F Cabrio": "9F Cabrio",
  "BF Injection": "BF Injection",
  "Bati 801": "Bati 801",
  "Bati 801RR": "Bati 801RR",
  "PCJ 600": "PCJ-600",
  "FQ 2": "FQ 2",
  "JB 700": "JB 700",
  "Z-Type": "Z-Type",
  "Rhino Tank": "Rhino",
  "Cuban 800": "Cuban 800",
  "Elegy RH8": "Elegy RH8",
  "Sabre Turbo": "Sabre Turbo",
  "Taco Van": "Taco Van",
  "Bobcat XL": "Bobcat XL",
  "Rapid GT": "Rapid GT",
  "Gang Burrito": "Gang Burrito",
  "Sandking XL": "Sandking XL",
  "Sandking SWB": "Sandking SWB",
  "Rancher XL": "Rancher XL",
  "Dubsta 6x6": "Dubsta 6x6",
  "BeeJay XL": "BeeJay XL",
  "Huntley S": "Huntley S",
  "Dune Buggy": "Dune Buggy",
  "Double T": "Double-T",
  "Carbon RS": "Carbon RS",
  "Entity XF": "Entity XF",
  "Turismo R": "Turismo R",
  "Stirling GT": "Stirling GT",
  "Coquette Classic": "Coquette Classic",
  "Coquette BlackFin": "Coquette BlackFin",
  "Zion Cabrio": "Zion Cabrio",
  "Oracle XS": "Oracle XS",
  "Sentinel XS": "Sentinel XS",
  "Felon GT": "Felon GT",
  "Cognoscenti Cabrio": "Cognoscenti Cabrio",
  "Stinger GT": "Stinger GT",
  "Baller LE": "Baller LE",
  "Prison Bus": "Prison Bus",
  "Barracks Semi": "Barracks Semi",
  "Dock Handler": "Dock Handler",
  "Scrap Truck": "Scrap Truck",
  "Lawn Mower": "Lawn Mower",
  "Space Docker": "Space Docker",
  "Police Predator": "Police Predator",
  "Police Cruiser": "Police Cruiser",
  "Police Buffalo": "Police Buffalo",
  "Police Transporter": "Police Transporter",
  "Police Bike": "Police Bike",
  "Police Riot": "RCV",
  "Police Maverick": "Police Maverick",
  "Unmarked Cruiser": "Unmarked Cruiser",
  "Sheriff Cruiser": "Sheriff Cruiser",
  "Sheriff SUV": "Sheriff SUV",
  "FIB Buffalo": "FIB",
  "FIB Granger": "FIB",
  "Park Ranger": "Park Ranger",

  // GTAO vehicles with compound names
  "Brioso R/A": "Brioso R/A",
  "Brioso 300": "Brioso 300",
  "Issi Classic": "Issi Classic",
  "Issi Sport": "Issi Sport",
  "Issi Rally": "Issi Rally",
  "Windsor Drop": "Windsor Drop",
  "Primo Custom": "Primo Custom",
  "Schafter V12": "Schafter V12",
  "Bestia GTS": "Bestia GTS",
  "Comet Retro Custom": "Comet Retro Custom",
  "Tropos Rallye": "Tropos Rallye",
  "Calico GTF": "Calico GTF",
  "Jester RR": "Jester RR",
  "Comet S2": "Comet S2",
  "Itali GTO": "Itali GTO",
  "Schlagen GT": "Schlagen GT",
  "Banshee 900R": "Banshee 900R",
  "Entity XXR": "Entity XXR",
  "Itali GTB": "Itali GTB",
  "Nero Custom": "Nero Custom",
  "Sultan RS": "Sultan RS",
  "X80 Proto": "X80 Proto",
  "Torero XO": "Torero XO",
  "Dominator GTT": "Dominator GTT",
  "Gauntlet Classic": "Gauntlet Classic",
  "Gauntlet Hellfire": "Gauntlet Hellfire",
  "Buffalo STX": "Buffalo STX",
  "Vigero ZX": "Vigero ZX",
  "Rapid GT Classic": "Rapid GT Classic",
  "Michelli GT": "Michelli GT",
  "Baller ST": "Baller ST",
  "Rebla GTS": "Rebla GTS",
  "Granger 3600LX": "Granger 3600LX",
  "Trophy Truck": "Trophy Truck",
  "Hakuchou Drag": "Hakuchou Drag",
  "Faggio Mod": "Faggio Mod",
  "Zombie Bobber": "Zombie Bobber",
  "Youga Classic": "Youga Classic",
  "Swift Deluxe": "Swift Deluxe",
  "Sea Sparrow": "Sea Sparrow",
  "Annihilator Stealth": "Annihilator Stealth",
  "Buzzard Attack Chopper": "Buzzard Attack Chopper",
  "Luxor Deluxe": "Luxor Deluxe",
  "B-11 Strikeforce": "B-11 Strikeforce",
  "Half-Track": "Half-track",
  "Insurgent Pick-Up": "Insurgent Pick-Up",
  "RE-7B": "RE-7B",
  "Rhino Tank": "Rhino (HD Universe)",
  "Khanjali": "TM-02 Khanjali",
  "Tug": "Tug (boat)",
  "Yacht": "Galaxy Super Yacht",
  "Barracks": "Barracks",
  "Stockade": "Stockade",
  "Dukes": "Dukes",
  "Sabre Turbo": "Sabre Turbo (HD Universe)",
  "Blade": "Blade",
  "Liberator": "Liberator",
  "Intruder": "Intruder (HD Universe)",
  "Vortex": "Vortex",
  "Rental Shuttle Bus": "Rental Shuttle Bus",
  "Jester (Racecar)": "Jester (Racecar)",

  // Simple name vehicles that have disambiguation
  "Dashound": "Dashound",
};

// Direct image URL overrides for vehicles where pageimages returns wrong/missing image
const directImageUrls = {
  "Merryweather Mesa": "https://static.wikia.nocookie.net/gtawiki/images/3/3c/Mesa3-GTAVe-front.png/revision/latest?cb=20240213231916",
  "FIB Granger": "https://static.wikia.nocookie.net/gtawiki/images/c/cf/FIB2-GTAV-front.png/revision/latest?cb=20151217204743",
  "FIB Buffalo": "https://static.wikia.nocookie.net/gtawiki/images/8/87/FIB-GTAV-front.png/revision/latest?cb=20151222203022",
  "Police Buffalo": "https://static.wikia.nocookie.net/gtawiki/images/3/3a/PoliceBuffalo-GTAV-FrontQuarter.png/revision/latest?cb=20180602085637",
  // Vehicles with no pageimages at all
  "Jetmax": "https://static.wikia.nocookie.net/gtawiki/images/e/e8/Jetmax-GTAV-front.png/revision/latest?cb=20160207130439",
  "Speeder": "https://static.wikia.nocookie.net/gtawiki/images/3/33/Speeder-GTAV-front.png/revision/latest?cb=20160117175437",
  "Stockade": "https://static.wikia.nocookie.net/gtawiki/images/5/50/Stockade-GTAV-front.png/revision/latest?cb=20240105191207",
  "Barracks": "https://static.wikia.nocookie.net/gtawiki/images/d/d4/Barracks-GTAV-front.png/revision/latest?cb=20160529142937",
  "Bati 801": "https://static.wikia.nocookie.net/gtawiki/images/d/d9/Bati801-GTAV-front.png/revision/latest?cb=20160127211358",
  "PCJ 600": "https://static.wikia.nocookie.net/gtawiki/images/7/74/PCJ600-GTAV-front.png/revision/latest?cb=20160121201111",
  "Bati 801RR": "https://static.wikia.nocookie.net/gtawiki/images/0/09/Bati801RR-GTAV-front-Barracho.png/revision/latest?cb=20160214210212",
  "Double T": "https://static.wikia.nocookie.net/gtawiki/images/8/8c/DoubleT-GTAV-front.png/revision/latest?cb=20160126212153",
  "Hakuchou Drag": "https://static.wikia.nocookie.net/gtawiki/images/f/fd/HakuchouDrag-GTAO-front.png/revision/latest?cb=20190921155821",
  "Nokota": "https://static.wikia.nocookie.net/gtawiki/images/1/13/Nokota-GTAO-front.PNG/revision/latest?cb=20170829142620",
  "Starling": "https://static.wikia.nocookie.net/gtawiki/images/0/0e/Starling-GTAO-front.PNG/revision/latest?cb=20170830172846",
  "ZR350": "https://static.wikia.nocookie.net/gtawiki/images/b/be/ZR350-GTAO-AdvertBadge.png/revision/latest?cb=20210806004555",
  "Lawn Mower": "https://static.wikia.nocookie.net/gtawiki/images/2/20/LawnMower-GTAV-front.png/revision/latest?cb=20161018180609",
  "Sabre Turbo": "https://static.wikia.nocookie.net/gtawiki/images/e/e6/SabreTurbo-GTAV-front.png/revision/latest?cb=20160308180541",
  "Blade": "https://static.wikia.nocookie.net/gtawiki/images/f/f3/Blade-GTAV-front.png/revision/latest?cb=20160410132747",
  // Vehicles where pageimages returns wrong GTA version
  "Tug": "https://static.wikia.nocookie.net/gtawiki/images/4/44/Tug-GTAO-front.png/revision/latest?cb=20160609144857",
  "Vortex": "https://static.wikia.nocookie.net/gtawiki/images/7/71/Vortex-GTAO-front.png/revision/latest?cb=20161004181943",
  "Dukes": "https://static.wikia.nocookie.net/gtawiki/images/5/53/Dukes-GTAV-front.png/revision/latest?cb=20150530114053",
  "Liberator": "https://static.wikia.nocookie.net/gtawiki/images/e/e0/Liberator-GTAV-front.png/revision/latest?cb=20160929162837",
  "Intruder": "https://static.wikia.nocookie.net/gtawiki/images/7/7c/Intruder-GTAV-front.png/revision/latest?cb=20160305191559",
};

async function findImage(vehicleName) {
  // Strategy 1: Check direct image URL overrides first (for vehicles with no pageimages)
  if (directImageUrls[vehicleName]) {
    return directImageUrls[vehicleName];
  }

  // Strategy 2: Use pageimages API (PRIMARY - always returns correct angle from infobox)
  const wikiTitle = wikiPageTitles[vehicleName] || vehicleName;
  try {
    const apiUrl = `https://gta.fandom.com/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json`;
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    if (data.query?.pages) {
      for (const page of Object.values(data.query.pages)) {
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
  } catch {}

  // Strategy 3: Try with (HD Universe) suffix for disambiguation
  try {
    const hdTitle = `${vehicleName} (HD Universe)`;
    const apiUrl = `https://gta.fandom.com/api.php?action=query&titles=${encodeURIComponent(hdTitle)}&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json`;
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    if (data.query?.pages) {
      for (const page of Object.values(data.query.pages)) {
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
  } catch {}

  // Strategy 4: Try compound name without spaces
  if (vehicleName.includes(' ')) {
    const noSpaces = vehicleName.replace(/\s+/g, '');
    try {
      const apiUrl = `https://gta.fandom.com/api.php?action=query&titles=${encodeURIComponent(noSpaces)}&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json`;
      const resp = await fetch(apiUrl);
      const data = await resp.json();
      if (data.query?.pages) {
        for (const page of Object.values(data.query.pages)) {
          if (page.thumbnail?.source) {
            return page.thumbnail.source;
          }
        }
      }
    } catch {}
  }

  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return new Response('Missing name', { status: 400 });
  }

  if (imageCache.has(name)) {
    return Response.redirect(imageCache.get(name), 302);
  }

  let imgUrl = await findImage(name);

  if (!imgUrl) {
    imgUrl = `https://placehold.co/600x338/0a0a0f/00FF88?text=${encodeURIComponent(name)}&font=roboto`;
  }

  imageCache.set(name, imgUrl);
  return Response.redirect(imgUrl, 302);
}
