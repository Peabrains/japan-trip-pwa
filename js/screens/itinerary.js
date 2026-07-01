'use strict';

const ItineraryScreen = (() => {

  /* -- Static guide link mapping -- */
  const STOP_LINKS = {
    sk09: [{title:'Bus: Kii-Tanabe to Hongu', url:'http://www2.tb-kumano.jp/en/transport/pdf/Tanabe-Shirahama-to-Hongu-bus.pdf'}],
    sk10: [{title:'Nakahechi Route Map (PDF)', url:'https://www2.tb-kumano.jp/en/kumano-kodo/pdf/Kumano-Kodo-Nakahechi-Route-Maps-Takijiri-Takahara.pdf'}],
    sk16: [{title:'Bus: Hongu-Kawayu-Yunomine', url:'http://www2.tb-kumano.jp/en/transport/pdf/Hongu-Kawayu-Yunomine-bus.pdf'}],
    sk20: [{title:'Bus: Hongu to Shingu', url:'http://www2.tb-kumano.jp/en/transport/pdf/Hongu-Koguchi-Shingu-bus.pdf'}],
    sk22: [{title:'Nachisan Travel Guide', url:'https://visitwakayama.jp/en/stories/detail_539.html'}],
    sk23: [{title:'Bus: Nachi-Kii-Katsuura', url:'https://www2.tb-kumano.jp/en/transport/pdf/Nachi-Kii-Katsuura-bus.pdf'}],
    sk30: [{title:'Alpine Route timetable (PDF)', url:'https://www.alpen-route.com/en/wp-content/uploads/2026/04/2026_timetable_nagano-toyamaedit.pdf'}],
    sk34: [{title:'Murodo Walks Map (PDF)', url:'https://www.alpen-route.com/en/assets_v2/file/walks_map.pdf'}],
  };

  /* ── Day stories ────────────────────────────────────────── */
  const DAY_STORIES = {
    d0: {
      teaser: 'The airport that opened in the sea — and is slowly sinking into it',
      html: `<p><a href="https://en.wikipedia.org/wiki/Kansai_International_Airport" target="_blank" rel="noopener">Kansai International Airport</a>, where you'll land at 06:30, sits on an artificial island in Osaka Bay — one of the most ambitious engineering projects of the 20th century. Completed in 1994, the island was constructed by dumping 180 million cubic metres of earth into the sea over six years. Engineers knew it would settle, but underestimated how much: the island has sunk nearly 13 metres, roughly three times the original projection, and continues to descend a few centimetres each year.</p>
<p>The airport was designed by Renzo Piano, who conceived the terminal building as a glider — a single curving roof 1.7 kilometres long that channels airflow to regulate temperature naturally. It remains one of the longest single-structure buildings in the world, and its slow disappearance into the bay gives the whole enterprise a quiet, geological drama.</p>
<p>You'll arrive as Japan is waking up. The Haruka Express from the airport to central Osaka takes 75 minutes and crosses the bay on an elevated track — your first view of the country will be industrial port, factory stacks, and the sudden density of a city of 2.7 million compressing toward the horizon.</p>`
    },
    d1: {
      teaser: 'The shrine where Japan\'s gods first touched land',
      html: `<p><a href="https://en.wikipedia.org/wiki/Kumano_Hayatama_Taisha" target="_blank" rel="noopener">Hayatama Taisha</a> in Shingu is the second of the three grand Kumano shrines, and the one with the most direct claim to Japan's creation mythology. According to the <a href="https://en.wikipedia.org/wiki/Kojiki" target="_blank" rel="noopener">Kojiki</a> — Japan's oldest chronicle, compiled in 712 AD — the gods Izanagi and Izanami descended to earth at Kumano. The river at Hayatama, where fresh water meets the sea, is where that descent was said to have occurred. You are visiting what the Japanese considered, for most of their recorded history, to be literally the beginning of the world.</p>
<p>The shrine's most sacred object is a branch of a <a href="https://en.wikipedia.org/wiki/Nageia_nagi" target="_blank" rel="noopener">nagi tree</a> believed to be over 1,000 years old, growing in the shrine grounds. Nagi leaves don't tear along the grain — they must be broken across it — which made them symbols of strong bonds and unbreakable connection. Pilgrims carried nagi leaves throughout the Kumano journey as protection.</p>
<p><a href="https://en.wikipedia.org/wiki/Kushimoto,_Wakayama" target="_blank" rel="noopener">Kushimoto</a>, where you're sleeping tonight, sits at the very tip of the Kii Peninsula — the southernmost point of Honshu, Japan's main island. The <a href="https://nankikumanogeo.jp/eng/geosite/hashiguiiwa/" target="_blank" rel="noopener">Hashigui-iwa</a> rock pillars you'll see tomorrow morning rise from the sea in a near-perfect line, and local legend attributes them to the god Kobo Daishi, who reportedly tried to build a bridge to nearby Shionoshima Island overnight and ran out of time before dawn.</p>`
    },
    d2: {
      teaser: 'The town where pilgrims died to themselves before walking toward the gods',
      html: `<p><a href="https://en.wikipedia.org/wiki/Tanabe,_Wakayama" target="_blank" rel="noopener">Kii-Tanabe</a> was for centuries the last city before the sacred mountains. Pilgrims arriving here — retired emperors, samurai, merchants, commoners — would shed their ordinary clothes and dress in white, the colour of death and ritual purity, before entering the Kumano. The logic was intentional: you were dying to your ordinary self before walking toward the divine.</p>
<p>The <a href="https://www.tb-kumano.jp/en/kumano-kodo/passport/" target="_blank" rel="noopener">Kumano Passport</a> you'll collect at the Tourist Information Centre is a modern continuation of a very old idea. Medieval pilgrims carried a similar document — a scroll stamped at each <em>oji</em> shrine — that served as both a spiritual record and proof of the journey. The stamp you collect at each site connects you, in a small and concrete way, to every person who has walked this path in the last thousand years.</p>
<p>The Kii Peninsula itself has been geographically isolated enough to preserve traditions that modernisation erased elsewhere. The mountains here are among the wettest in Japan — over 3,000mm of rainfall annually in some valleys — which produces the enormous cedar and cypress forests that make the trail feel prehistoric. The trees are not decorative. They have been growing since before the shrines were built.</p>`
    },
    d3: {
      teaser: 'The womb rock — and why crawling through it still means something',
      html: `<p><a href="https://www.tb-kumano.jp/en/places/takijiri/" target="_blank" rel="noopener">Takijiri-oji</a> is the formal trailhead of the Nakahechi route, and one of the most sacred spots on the entire pilgrimage. The <em>tainai-kuguri</em> — the womb-crawling rock — is a natural cave formation that pilgrims pass through as a ritual act of rebirth. You enter as your ordinary self and emerge, symbolically, as a pilgrim. The gesture has been performed here for over a thousand years, by emperors and commoners alike.</p>
<p>The climb from Takijiri to <a href="https://www.tb-kumano.jp/en/places/takahara/" target="_blank" rel="noopener">Takahara</a> is steep — roughly 350 metres of vertical gain in under 4 kilometres — but the ridge top reveals a view that explains why people have been walking to this specific place since the 9th century. The village appears above the clouds on clear mornings, surrounded by terraced fields that have been farmed since the Heian period. The landscape looks unchanged because it largely is.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Kumano_Kodo" target="_blank" rel="noopener">Nakahechi route</a> was the imperial road — the path taken by retired emperors making the pilgrimage from Kyoto. Between 907 and 1221, emperors made this journey over a hundred times. The entourages numbered in the thousands, which explains the width of the stone paths: they were not built for solitary pilgrims but for processions. You'll feel the scale of that when the forest closes in and the path narrows to single file.</p>`
    },
    d4: {
      teaser: 'The cold spring that never runs dry — and the 800-year-old cedar that watches over it',
      html: `<p>The <a href="https://www.tb-kumano.jp/en/places/nonaka/" target="_blank" rel="noopener">Nonaka-no-Shimizu</a> spring near Chikatsuyu has been flowing without interruption for as long as records exist. It was listed as one of the finest waters in Japan in the 10th-century poetic anthology the <a href="https://en.wikipedia.org/wiki/Man%27y%C5%8Dsh%C5%AB" target="_blank" rel="noopener">Manyoshu</a>, which means poets were writing about this specific spring — the one you'll pass today — over 1,200 years ago. Medieval pilgrims stopped here to drink before the hardest section of the trail. The water is still clean enough to drink directly.</p>
<p><a href="https://japantravel.navitime.com/en/area/jp/spot/02301-2400237/" target="_blank" rel="noopener">Tsugizakura-oji</a>, where the day ends, takes its name from a cedar tree that has stood beside the shrine for roughly 800 years. <em>Tsugizakura</em> means "grafted cherry" — according to tradition, the great Buddhist monk Gyoki grafted a cherry cutting onto a cedar trunk in the 8th century. The cedar survived; the cherry did not. What remains is one of the most photographed trees on the Kumano Kodo.</p>
<p>The 16 kilometres you're walking today crosses terrain that sees relatively few non-Japanese pilgrims, partly because this section lacks the dramatic landmarks of Hongu or Nachi. What it has instead is the texture of the trail itself: moss-covered stone steps, narrow ridgelines with views into uninhabited valleys, and a quality of silence that only exists this far from roads.</p>`
    },
    d5: {
      teaser: 'The world\'s only UNESCO heritage hot spring — and the shrine built in the wrong place',
      html: `<p><a href="https://en.wikipedia.org/wiki/Kumano_Hongu_Taisha" target="_blank" rel="noopener">Kumano Hongu Taisha</a> is the most important of the three grand Kumano shrines, and it was originally built on a sand spit in the middle of a river delta. A catastrophic flood in 1889 destroyed the outer precincts and forced the main hall to be relocated uphill. The original riverside site, called <a href="https://www.japan.travel/en/spot/978/" target="_blank" rel="noopener">Oyunohara</a>, is now an empty gravel plain containing the largest torii gate in the world: 34 metres tall, standing alone in the open, marking a threshold that no longer has a building behind it.</p>
<p><a href="https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/tsugizakura-oji-to-kumano-hongu-taisha/hosshinmon-oji-to-kumano-hongu-taisha/" target="_blank" rel="noopener">Hosshinmon-oji</a>, the triple-torii gate you'll pass in the morning, traditionally marked the point at which pilgrims were considered to have spiritually arrived at Hongu — still several kilometres of walking away from the shrine itself. The idea was that arrival was not a place but a state of mind, and the gate was the moment you entered it.</p>
<p><a href="https://en.wikipedia.org/wiki/Yunomine_Onsen" target="_blank" rel="noopener">Tsuboyu</a> at Yunomine Onsen is the only hot spring in the world designated a UNESCO World Heritage site. It is also, physically, a small wooden hut built over a river rock, accommodating two people at a time for thirty-minute slots. The spring changes colour — turquoise, white, green — depending on temperature and mineral content. Pilgrims have been bathing here for 1,800 years. The queue on busy days can be long. It is still worth it.</p>`
    },
    d6: {
      teaser: 'The river that becomes a hot spring — and the festival that hasn\'t stopped in 1,800 years',
      html: `<p><a href="https://www.tb-kumano.jp/en/places/kawayu/" target="_blank" rel="noopener">Kawayu Onsen</a> is unusual even by Japanese onsen standards: the hot spring doesn't emerge from a building but from the riverbed itself. The Oto River runs warm here because of geothermal activity beneath the gravel, and in winter the locals dam the river to create <em>Sennin Buro</em> — the "Thousand Person Bath" — an open-air communal pool the size of a small swimming pool, free to anyone who walks in. In April the dam is gone, but hot patches still seep through the river stones.</p>
<p>The spring matsuri at Hongu Taisha that you may catch today is part of a festival calendar that has continued here with essentially no interruption since the shrine's founding. Japanese festivals of this kind — <em>matsuri</em> — are not commemorations of historical events; they are the events themselves, repeated annually to maintain the relationship between the human and divine worlds. The same rituals performed today are understood to be identical in function to those performed a thousand years ago.</p>
<p><a href="https://www.japan-guide.com/e/e4800.html" target="_blank" rel="noopener">Shugendo</a>, the mountain ascetic practice that shaped much of Kumano's religious culture, treated the physical landscape as a living diagram of the Buddhist cosmos. Walking into the mountains was walking into the afterlife — specific peaks and valleys corresponded to specific realms. The rest day here is, whether or not you think of it this way, the pause at the centre of that journey before the descent begins.</p>`
    },
    d7: {
      teaser: 'The boat that carries the dead — and the living — back down from the mountains',
      html: `<p>The <a href="https://en.wikipedia.org/wiki/Kumano_River" target="_blank" rel="noopener">Kumano-gawa river journey</a> from Hongu to Shingu has been the traditional return route from the pilgrimage for over a thousand years. Where the ascent through the mountains represented the journey into the realm of the dead, the river descent represented the return to the world of the living. Retired emperors made this voyage. So did the warriors, merchants, and commoners who followed in their wake. The cedar boat you'll board at 14:30 is a replica of the vessels used for that journey — flat-bottomed, steered with long poles through the gorge.</p>
<p><a href="https://en.wikipedia.org/wiki/Nachikatsuura,_Wakayama" target="_blank" rel="noopener">Kii-Katsuura</a> is famous throughout Japan for one thing above all others: bluefin tuna. The town handles one of the largest tuna landings in Japan, and the morning market at the harbour has been running since the fishing industry established itself here in the early 20th century. The tuna auctioned here at dawn ends up in sushi restaurants across the country by the same evening.</p>
<p>The coastline around Katsuura is one of the few places in Japan where you can stay in a hotel built directly into a cliff face, with private open-air baths cut from the rock above the Pacific. The spa hotel tradition here predates modern tourism — the water was considered healing, and the remoteness was the point.</p>`
    },
    d8: {
      teaser: 'Japan\'s tallest waterfall — and the god that lives inside it',
      html: `<p><a href="https://en.wikipedia.org/wiki/Nachi_Falls" target="_blank" rel="noopener">Nachi Falls</a> drops 133 metres in a single unbroken cascade, the tallest waterfall in Japan, and has been worshipped as a deity in its own right for over a thousand years — not as a place where a god lives, but as the god itself. The waterfall is an object of <em>shintai</em>: the physical body of the divine. The shrine built beside it is not the sacred site; the waterfall is. The shrine exists to serve it.</p>
<p><a href="https://en.wikipedia.org/wiki/Seiganto-ji" target="_blank" rel="noopener">Seiganto-ji</a>, the three-storey vermillion pagoda that appears in every photograph of Nachi, has stood beside the falls since at least the 4th century. It is the first temple on the <a href="https://en.wikipedia.org/wiki/Saigoku_Kannon_Pilgrimage" target="_blank" rel="noopener">Saigoku Kannon Pilgrimage</a> — a 33-temple circuit across the Kansai region walked since the 10th century. The stone steps of <a href="https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/daimon-zaka/" target="_blank" rel="noopener">Daimon-zaka</a> that you'll climb before dawn were laid by pilgrims and devotees over generations, worn smooth by a millennium of feet.</p>
<p>Completing the <a href="https://en.wikipedia.org/wiki/Kumano_Sanzan" target="_blank" rel="noopener">Kumano Sanzan</a> — all three grand shrines — earns a <em>sanzan kanke</em> certificate and places you in the company of everyone who has made this specific circuit, from 10th-century emperors to present-day walkers. The number who have done it is enormous. The number who did it on foot through the mountains, the way you just did, is considerably smaller.</p>`
    },
    d9: {
      teaser: 'The cave where a goddess hid the sun — and the forest that grew to mark the spot',
      html: `<p><a href="https://en.wikipedia.org/wiki/Togakushi,_Nagano" target="_blank" rel="noopener">Togakushi</a> means "hidden door." According to <a href="https://en.wikipedia.org/wiki/Japanese_mythology" target="_blank" rel="noopener">Shinto mythology</a>, the sun goddess Amaterasu withdrew from the world into a cave after her brother's violent rampage, plunging heaven and earth into darkness. The other gods lured her out with music and laughter — and when she opened the cave door, a strong god hurled it away. That door, in the mythology, landed here. The mountain above Togakushi is the door.</p>
<p>The five shrines of Togakushi are spread across the mountain in a deliberate sequence — each one deeper into the forest, each one accessed by a longer and narrower path. The cryptomeria avenue leading to <a href="https://en.wikipedia.org/wiki/Togakushi_Shrine" target="_blank" rel="noopener">Okusha</a>, the innermost shrine, is lined with roughly 200 cedar trees between 300 and 900 years old. The canopy closes overhead, the light drops, and the path narrows to a stone track barely wide enough for two people. It is one of the most atmospheric approaches to any shrine in Japan.</p>
<p>Togakushi is also the birthplace of <a href="https://en.wikipedia.org/wiki/Ninjutsu" target="_blank" rel="noopener">ninjutsu</a> — or at least one of its major historical schools. The Togakure-ryu school of ninja arts was founded here in the 12th century, and the mountain's complex network of hidden paths and dense forest was used for training. The ninja museum in the village takes this seriously. The shrine does not mention it at all.</p>`
    },
    d10: {
      teaser: 'A tunnel drilled through a living mountain — and the sixty-nine people it cost',
      html: `<p>The <a href="https://en.wikipedia.org/wiki/Tateyama_Kurobe_Alpine_Route" target="_blank" rel="noopener">Kurobe Alpine Route</a> crosses the <a href="https://en.wikipedia.org/wiki/Hida_Mountains" target="_blank" rel="noopener">Northern Japan Alps</a> through a sequence of vehicles that reads like an engineering catalogue: bus, electric trolleybus, cable car, aerial ropeway, another trolleybus. The route was conceived in the 1950s to service the Kurobe Dam construction project and opened to tourists in 1971. It has been described as the most dramatic journey in Japan that doesn't require a hiking permit.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Kurobe_Dam" target="_blank" rel="noopener">Kurobe Dam</a>, completed in 1963, is Japan's tallest arch dam at 186 metres. Building it required drilling through the granite heart of the Alps — workers encountered an underground hot spring that flooded the access tunnel with scalding water, set construction back by months, and killed men before it could be controlled. Sixty-nine workers died during the seven-year project. A stone memorial stands inside the mountain, in the tunnel you'll pass through on the electric trolleybus. Most visitors don't know it's there.</p>
<p>The snow corridor at <a href="https://www.alpen-route.com/en/enjoy/murodo.html" target="_blank" rel="noopener">Murodo</a> — walls of compacted snow rising 13 to 18 metres on either side of the cleared road — is opened each spring by a crew that uses GPS to locate the road surface buried beneath. The walls are taller than a six-storey building and the sky above is a strip of blue between white cliffs. Murodo sits at 2,450 metres and sees snow for ten months of the year. In April, the surrounding peaks are still deep in winter.</p>`
    },
    d11: {
      teaser: 'Japan\'s tallest waterfall, a wetland older than civilisation, and the train that ends the journey',
      html: `<p><a href="https://en.wikipedia.org/wiki/Sh%C5%8Dmy%C5%8D_Falls" target="_blank" rel="noopener">Shomyo Falls</a>, visible from Murodo on a clear morning, drops 350 metres — the tallest waterfall in Japan by total height, though it falls in stages rather than a single cascade like Nachi. In spring, a second waterfall — Hannoki Falls — runs parallel to it from snowmelt, making the combined view one of the most dramatic in the country. By summer, Hannoki has usually disappeared.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Midagahara" target="_blank" rel="noopener">Midagahara Wetlands</a> that the bus descends through are a high-altitude bog that has been accumulating plant material for roughly 8,000 years. The peat beneath the surface is a continuous archive of pollen, climate data, and atmospheric change going back to the end of the last ice age. Scientists core into it to read the history of the region the way you'd read tree rings — layer by layer, millennium by millennium.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Hokuriku_Shinkansen" target="_blank" rel="noopener">Hokuriku Shinkansen</a> that brings you back to Osaka extended to <a href="https://en.wikipedia.org/wiki/Tsuruga,_Fukui" target="_blank" rel="noopener">Tsuruga</a> in March 2024, connecting the Sea of Japan coast to the high-speed network for the first time. The route passes through terrain that was, for most of Japanese history, considered genuinely remote — mountain passes that took days on foot now take minutes at 260 km/h. The journey back will feel very different from the journey out.</p>`
    },
    d12: {
      teaser: 'The city that invented modern finance, street food, and the world\'s first futures market',
      html: `<p>Osaka has spent most of its history being underestimated. It lacks Kyoto's temples and Tokyo's scale, and it has never particularly cared. What it has instead is a long-running civic identity organised entirely around commerce and food — a city built by merchants rather than samurai, which makes it unusual in Japan and, in some ways, more legible to outsiders.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Dojima_Rice_Exchange" target="_blank" rel="noopener">Dojima Rice Exchange</a>, founded in 1697 in what is now a quiet riverside neighbourhood, was the world's first standardised futures market. Traders here bought and sold rice that hadn't been harvested yet, developed standardised contracts, created the concept of margin trading, and established practices that modern financial markets still use. The building is gone. The neighbourhood gives no indication of what happened there.</p>
<p><a href="https://en.wikipedia.org/wiki/D%C5%8Dtonbori" target="_blank" rel="noopener">Dotonbori</a>, the canal street where you'll inevitably eat several meals, follows a waterway dug in 1615 to supply Osaka Castle. The castle was built by <a href="https://en.wikipedia.org/wiki/Toyotomi_Hideyoshi" target="_blank" rel="noopener">Toyotomi Hideyoshi</a> — the man who unified Japan after a century of civil war — and after his death was dismantled by the Tokugawa shogunate who replaced him. The current structure, completed in 1931, is a concrete reconstruction with an elevator inside. Hideyoshi's actual castle is the ground it stands on.</p>`
    },
    d13: {
      teaser: 'Osaka has a second story — and it runs a thousand years deeper than the neon',
      html: `<p><a href="https://en.wikipedia.org/wiki/Osaka_Castle" target="_blank" rel="noopener">Osaka Castle</a> sits on the site of the Ishiyama Honganji, a Buddhist fortress-temple that held out against the warlord Oda Nobunaga for eleven years — one of the longest sieges in Japanese history, ending in 1580. The monks who defended it were not soldiers but adherents of a Buddhist sect so powerful it had become a military and political force in its own right. When the temple finally fell, Nobunaga had it burned. Hideyoshi built his castle on the ash.</p>
<p><a href="https://en.wikipedia.org/wiki/Shinsekai" target="_blank" rel="noopener">Shinsekai</a>, the retro neighbourhood in southern Osaka, was designed in 1912 as a deliberate copy of two foreign cities: the northern half modelled on Paris, with a central tower (the original Tsutenkaku) as its Eiffel analogue, and the southern half on Coney Island in New York. Both models were considered the pinnacle of modern urban life at the time. Shinsekai fell into neglect by the mid-20th century and is now valued precisely for its unchanged shabbiness — a preservation by accident rather than intention.</p>
<p><a href="https://en.wikipedia.org/wiki/Kuromon_Market" target="_blank" rel="noopener">Kuromon Ichiba</a>, the covered market that has been running since 1902, was known as "Osaka's kitchen" — the place where chefs and home cooks came for the freshest fish and produce in the city. It still functions that way, though it now operates alongside a tourist trade that has made it one of the busiest food destinations in western Japan. The stalls that have been here longest tend to be at the quieter end of the arcade, away from the entrance crowds.</p>`
    },
    d14: {
      teaser: 'The airport built on a disappearing island — and the journey that\'s now behind you',
      html: `<p><a href="https://en.wikipedia.org/wiki/Kansai_International_Airport" target="_blank" rel="noopener">Kansai International Airport</a>, where you'll depart, has been sinking since the day it opened. The artificial island settles a few centimetres each year into the soft bay sediment beneath it, and engineers have been making quiet adjustments to the terminal foundations since the 1990s. The building has been jacked up in sections, columns have been extended, and the whole structure has been adapted to a slow-motion geological event that nobody could fully predict. It continues to function perfectly.</p>
<p>The <a href="https://en.wikipedia.org/wiki/Shinkansen" target="_blank" rel="noopener">Shinkansen</a> network you've used across the trip carried its ten-billionth passenger sometime in the 2010s. In sixty years of operation, it has never had a passenger fatality from a crash or derailment. The punctuality standard that qualifies a Shinkansen as "delayed" is more than one minute late. The average actual delay, across the entire network, is under a minute. These are not achievements Japan advertises aggressively. They are simply how the trains run.</p>
<p>You've walked a thousand-year-old pilgrimage route, crossed the Northern Alps on five different vehicles, stood in a snow corridor 18 metres deep in April, and come back to the city where the trip started. Osaka will feel different on the way out — not because it has changed but because you have a frame for it now. That's what going somewhere properly does. You've done that.</p>`
    },
  };

  let root;

  /* ── Accordion state (module-level — survives re-renders) ── */
  const daysExpanded = {};
  const storiesExpanded = {};
  let _toggling = false;

  const SEG_COLOR = {
    transit: '#AAAAAA',
    kumano:  '#C1440E',
    nagano:  '#7B4EA0',
    alpine:  '#2A7A4B',
    osaka:   '#888888',
  };

  function getDayExpanded(dayId) {
    if (daysExpanded[dayId] === undefined) daysExpanded[dayId] = true;
    return daysExpanded[dayId];
  }

  function toggleDay(dayId) {
    if (_toggling) return;
    _toggling = true;
    daysExpanded[dayId] = !getDayExpanded(dayId);
    render();
    setTimeout(() => { _toggling = false; }, 250);
  }

  function getStoryExpanded(dayId) {
    return !!storiesExpanded[dayId];
  }

  function toggleStory(dayId, cardEl) {
    storiesExpanded[dayId] = !getStoryExpanded(dayId);
    const body = cardEl.querySelector('.story-body');
    const chevron = cardEl.querySelector('.story-chevron');
    const isNowOpen = storiesExpanded[dayId];
    body.style.maxHeight = isNowOpen ? body.scrollHeight + 'px' : '0';
    chevron.innerHTML = isNowOpen ? '&#9660;' : '&#9654;';
  }

  function badge(status) {
    const m = {
      booked:  ['badge-booked',  '✓ Booked'],
      pending: ['badge-pending', 'Pending'],
      urgent:  ['badge-urgent',  '⚡ Urgent'],
      open:    ['badge-open',    'Open'],
    };
    const [cls, lbl] = m[status] || m.open;
    return `<span class="badge ${cls}">${lbl}</span>`;
  }

  /* ─── Story card ────────────────────────────────────────── */
  function storyCard(dayId) {
    const story = DAY_STORIES[dayId];
    if (!story) return null;

    const isOpen = getStoryExpanded(dayId);

    const card = document.createElement('div');
    card.className = 'story-card';

    card.innerHTML = `
      <div class="story-header">
        <span class="story-icon">📖</span>
        <span class="story-teaser">The Story — ${story.teaser}</span>
        <span class="story-chevron">${isOpen ? '&#9660;' : '&#9654;'}</span>
      </div>
      <div class="story-body" style="max-height:${isOpen ? '2000px' : '0'}">
        <div class="story-prose">${story.html}</div>
      </div>`;

    card.querySelector('.story-header').addEventListener('click', () => toggleStory(dayId, card));
    return card;
  }

  /* ─── Day header (accordion) ────────────────────────────── */
  function dayHeader(day, stops, isOpen) {
    const wrap = document.createElement('div');
    wrap.className = 'tl-day-block';

    const row = document.createElement('div');
    row.className = 'tl-day-header-row tl-day-header--tap';
    row.innerHTML = `
      <div class="tl-day-pill"><span class="tl-day-label">${day.label}</span></div>
      <div class="tl-day-meta">
        <span class="tl-day-date">${day.date}</span>
        <span class="tl-day-title-text">${day.title}</span>
      </div>
      <span class="tl-chevron">${isOpen ? Icons.chevronUp('icon-sm') : Icons.chevronDown('icon-sm')}</span>`;
    row.addEventListener('click', () => toggleDay(day.id));
    wrap.appendChild(row);

    if (!isOpen && stops.length === 0) {
      const hint = document.createElement('p');
      hint.className = 'tl-empty-hint';
      hint.textContent = 'No stops · tap to expand and add';
      wrap.appendChild(hint);
    }

    return wrap;
  }

  /* ─── Overnight card ────────────────────────────────────── */
  function overnightCard(day) {
    const o = Data.getOvernight(day.id);
    if (!o?.name) return null;
    const statusCls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'};
    const card = document.createElement('div');
    card.className = 'overnight-card';
    card.innerHTML = `
      <div class="overnight-inner">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          ${Icons.moon('icon-sm')}
          <div style="min-width:0">
            <p class="overnight-label">Overnight</p>
            <p class="overnight-name">${o.name}</p>
            ${o.address ? `<p class="overnight-addr">${o.address}</p>` : ''}
          </div>
        </div>
        <span class="badge ${statusCls[o.status]||'badge-open'}">${o.status==='booked'?'✓':o.status==='urgent'?'⚡':o.status==='pending'?'Pending':'Open'}</span>
      </div>`;
    card.addEventListener('click', () => BottomSheet.openOvernight(day));
    return card;
  }

  /* ─── Add stop button ───────────────────────────────────── */
  function addStopBtn(dayId) {
    const btn = document.createElement('button');
    btn.className = 'add-stop-btn';
    btn.innerHTML = `${Icons.plus('icon-sm')} Add stop`;
    btn.addEventListener('click', () => BottomSheet.openAdd(dayId));
    return btn;
  }

  /* ─── Stop row ──────────────────────────────────────────── */
  function stopRow(stop, isLast) {
    const day = Data.getDays().find(d => d.id === stop.dayId);
    const iconKey = stop.transportType || 'walk';
    const stampCollected = stop.hasStamp && Data.isStampCollected(stop.id);
    const segColor = SEG_COLOR[stop.segment] || '#888';

    const row = document.createElement('div');
    row.className = 'tl-row';
    row.innerHTML = `
      <div class="tl-time">
        <span class="tl-time-val">${stop.time || '—'}</span>
        <span class="tl-time-tz">${stop.timeZone || ''}</span>
      </div>
      <div class="tl-connector">
        <div class="tl-icon-circle" style="border-color:${segColor};color:${segColor}">
          ${Icons[iconKey] ? Icons[iconKey]() : Icons.walk()}
        </div>
        ${!isLast ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-content">
        <div class="tl-name-row">
          <p class="tl-name">${stop.name}</p>
          ${stop.hasStamp ? `<span class="tl-stamp-dot ${stampCollected?'tl-stamp-dot--on':''}\">${stop.stampKanji||'判'}</span>` : ''}
        </div>
        <p class="tl-activity">${stop.activity || ''}</p>
        ${stop.openingHours ? `<p class="tl-hours">◷ ${stop.openingHours}</p>` : ''}
        ${stop.transport ? `<div class="tl-transport">${Icons[iconKey]?Icons[iconKey]():''}<span>${stop.transport}</span></div>` : ''}
        ${stop.transportType==='train' && stop.trainDetail?.jrPass===false
          ? '<p class="tl-platform" style="color:var(--warning-text)">⚠ Not on JR Pass · buy separately</p>'
          : stop.transportType==='train' && stop.trainDetail?.jrPass
            ? '<p class="tl-platform">JR Pass ✓</p>' : ''}
        ${stop.transportType==='train' && stop.trainDetail?.platform
          ? `<p class="tl-platform">Platform: ${stop.trainDetail.platform}</p>` : ''}
        ${stop.notes ? `<p class="tl-note">${stop.notes}</p>` : ''}
        <div class="tl-footer">
          ${badge(stop.booking.status)}
          ${stop.category==='transport' ? '<span class="cat-chip cat-chip--transport">Transport</span>' :
            stop.category==='activity'  ? '<span class="cat-chip cat-chip--activity">Activity</span>' : ''}
          ${stop.trainDetail?.seatReservation ? '<span class="cat-chip cat-chip--jr">Seat res.</span>' : ''}
        </div>
        ${(STOP_LINKS[stop.id]||[]).map(l=>`<a href="${l.url}" target="_blank" rel="noopener" class="tl-link-chip" onclick="event.stopPropagation()">\u2197 ${l.title}</a>`).join('')}
      </div>`;
    row.addEventListener('click', () => BottomSheet.openStop(stop, day));
    return row;
  }

  /* ─── Main render ───────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';

    Data.getDays().forEach(day => {
      const stops  = Data.getStopsByDay(day.id);
      const isOpen = getDayExpanded(day.id);

      // Day header (always visible)
      root.appendChild(dayHeader(day, stops, isOpen));

      if (isOpen) {
        // Weather strip
        if (navigator.onLine) {
          const wxEl = document.createElement('div');
          wxEl.className = 'wx-container';
          root.appendChild(wxEl);
          if (day.weatherPoints) {
            Weather.renderMultiStrip(wxEl, day.weatherPoints);
          } else {
            const wxStop = stops.find(s => s.lat && s.lng);
            if (wxStop) Weather.renderStrip(wxEl, wxStop.lat, wxStop.lng, day.locality || wxStop.name);
          }
        }

        // Story card — sits between weather and stops
        const sc = storyCard(day.id);
        if (sc) root.appendChild(sc);

        // Day divider
        root.appendChild(Object.assign(document.createElement('div'), {className:'tl-day-divider'}));

        // Stop rows
        stops.forEach((s, i) => root.appendChild(stopRow(s, i === stops.length - 1)));

        // Overnight card
        const accom = overnightCard(day);
        if (accom) root.appendChild(accom);

        // Add stop button
        root.appendChild(addStopBtn(day.id));

        // Custom links tagged to this day
        const dayLinks = (Data.getCustomLinks?.() || []).filter(l => l.dayId === day.id);
        if (dayLinks.length) {
          const dlWrap = document.createElement('div');
          dlWrap.className = 'day-links-wrap';
          dlWrap.innerHTML = '<p class="day-links-head">🔖 Resources</p>'
            + dayLinks.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="tl-link-chip">\u2197 ${l.title}</a>`).join('');
          root.appendChild(dlWrap);
        }
      }
    });
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.ItineraryScreen = ItineraryScreen;
