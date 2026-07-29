/* ============================================================================
   GUESS THE WORD — Real-time Multiplayer Party Game
   Single-file production server: Express + Socket.IO + embedded client
   Run:  npm install express socket.io
         node server.js
   ============================================================================ */

'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 8000
});

const PORT = process.env.PORT || 3000;

/* ============================================================================
   SECTION 1: WORD DATABASE
   Every entry: { word, category, difficulty, hints:[h1,h2,h3] }
   Categories: general, science, technology, geography, history, sports,
               movies, space, food, animals
   Difficulty: easy, medium, hard
   ("mixed" difficulty/category are resolved at query time — see getWordPool)
   ============================================================================ */

const WORD_DB = [];

function addWords(category, difficulty, entries) {
  for (const e of entries) {
    WORD_DB.push({
      word: e[0].toUpperCase(),
      category,
      difficulty,
      hints: [e[1], e[2], e[3]]
    });
  }
}

/* ---------------------------- GENERAL ---------------------------- */
addWords('general', 'easy', [
  ['CHAIR', 'Furniture', 'You sit on it', 'Has four legs usually'],
  ['TABLE', 'Furniture', 'Flat surface on legs', 'You eat meals on it'],
  ['PENCIL', 'Writing tool', 'Made of wood and graphite', 'Has an eraser on top'],
  ['WINDOW', 'Part of a house', 'Lets light in', 'Made of glass'],
  ['MIRROR', 'Household item', 'Shows your reflection', 'Can be broken by bad luck superstition'],
  ['BOTTLE', 'Container', 'Holds liquid', 'Often made of plastic or glass'],
  ['UMBRELLA', 'Rain gear', 'Keeps you dry', 'Opens up like a canopy'],
  ['BLANKET', 'Bedding', 'Keeps you warm', 'You wrap yourself in it'],
  ['CANDLE', 'Light source', 'Made of wax', 'Has a wick that burns'],
  ['LADDER', 'Climbing tool', 'Has rungs', 'Used to reach high places']
]);
addWords('general', 'medium', [
  ['CALENDAR', 'Time tool', 'Shows days and months', 'Hangs on a wall'],
  ['TELESCOPE', 'Viewing device', 'Used to see far away', 'Astronomers use it'],
  ['ENVELOPE', 'Mail item', 'Holds a letter', 'You seal it shut'],
  ['COMPASS', 'Direction tool', 'Has a needle', 'Points north'],
  ['NOTEBOOK', 'Writing item', 'Has many pages', 'Students use it'],
  ['STAIRCASE', 'Structure', 'Connects floors', 'Made of steps'],
  ['KEYBOARD', 'Input device', 'Has many keys', 'Used to type'],
  ['MICROWAVE', 'Kitchen appliance', 'Heats food fast', 'Uses radiation waves'],
  ['SUITCASE', 'Travel item', 'Holds clothes', 'You pack it for a trip'],
  ['THERMOSTAT', 'Climate device', 'Controls temperature', 'Found on walls']
]);
addWords('general', 'hard', [
  ['METRONOME', 'Music device', 'Keeps a steady beat', 'Used by musicians practicing'],
  ['KALEIDOSCOPE', 'Optical toy', 'Shows changing patterns', 'You look through one end'],
  ['KILN', 'Heating chamber', 'Used to fire pottery', 'Reaches very high temperatures'],
  ['ABACUS', 'Counting tool', 'Uses beads on rods', 'Ancient calculator'],
  ['SUNDIAL', 'Timekeeping device', 'Uses a shadow', 'Relies on the sun'],
  ['SCAFFOLDING', 'Construction structure', 'Temporary framework', 'Workers stand on it'],
  ['CHANDELIER', 'Lighting fixture', 'Hangs from a ceiling', 'Often has crystals'],
  ['TAPESTRY', 'Woven artwork', 'Hangs on a wall', 'Tells a story in threads'],
  ['GYROSCOPE', 'Spinning device', 'Resists changes in orientation', 'Used in navigation systems'],
  ['LABYRINTH', 'Complex structure', 'Full of winding paths', 'Easy to get lost in']
]);

/* ---------------------------- SCIENCE ---------------------------- */
addWords('science', 'easy', [
  ['ATOM', 'Basic unit', 'Smallest unit of matter', 'Has protons and electrons'],
  ['GRAVITY', 'Force', 'Pulls things down', 'Keeps you on the ground'],
  ['MAGNET', 'Object', 'Attracts metal', 'Has two poles'],
  ['OXYGEN', 'Gas', 'You breathe it', 'Chemical symbol O'],
  ['VOLCANO', 'Landform', 'Erupts with lava', 'Found on tectonic plates'],
  ['SKELETON', 'Body structure', 'Made of bones', 'Supports your body'],
  ['BACTERIA', 'Microorganism', 'Too small to see', 'Some cause disease'],
  ['ENERGY', 'Physical quantity', 'Powers motion', 'Comes in many forms'],
  ['CRYSTAL', 'Solid structure', 'Has a repeating pattern', 'Salt forms these'],
  ['VIRUS', 'Pathogen', 'Needs a host to reproduce', 'Causes infections']
]);
addWords('science', 'medium', [
  ['MOLECULE', 'Chemistry unit', 'Made of atoms bonded together', 'Water is one example'],
  ['ECOSYSTEM', 'Biology term', 'Living things and environment together', 'Includes predators and prey'],
  ['ENZYME', 'Biological catalyst', 'Speeds up reactions', 'Made of protein'],
  ['PHOTOSYNTHESIS', 'Plant process', 'Converts sunlight to energy', 'Produces oxygen'],
  ['ELECTRON', 'Subatomic particle', 'Negatively charged', 'Orbits the nucleus'],
  ['MITOCHONDRIA', 'Cell part', 'Powerhouse of the cell', 'Produces energy'],
  ['VACCINE', 'Medical treatment', 'Trains the immune system', 'Prevents disease'],
  ['GENOME', 'Genetic term', 'Complete set of DNA', 'Unique to each organism'],
  ['ISOTOPE', 'Chemistry term', 'Variant of an element', 'Differs in neutron count'],
  ['CATALYST', 'Chemistry term', 'Speeds up a reaction', 'Not consumed in the process']
]);
addWords('science', 'hard', [
  ['ENTROPY', 'Thermodynamics term', 'Measure of disorder', 'Always increases in a closed system'],
  ['QUANTUM', 'Physics term', 'Smallest discrete unit', 'Basis of quantum mechanics'],
  ['ELECTROLYSIS', 'Chemical process', 'Uses electric current', 'Splits compounds apart'],
  ['SUPERCONDUCTOR', 'Material', 'Zero electrical resistance', 'Works at very low temperatures'],
  ['CHROMOSOME', 'Genetic structure', 'Carries genes', 'Humans have 46'],
  ['NEUROTRANSMITTER', 'Chemical messenger', 'Sends signals between neurons', 'Dopamine is one example'],
  ['SPECTROSCOPY', 'Analysis method', 'Studies light and matter', 'Identifies chemical composition'],
  ['THERMODYNAMICS', 'Physics branch', 'Studies heat and energy', 'Has four fundamental laws'],
  ['POLYMERASE', 'Enzyme type', 'Builds nucleic acid chains', 'Essential for DNA replication'],
  ['RADIOACTIVITY', 'Nuclear phenomenon', 'Emission of particles or rays', 'Discovered by Marie Curie']
]);

/* ---------------------------- TECHNOLOGY ---------------------------- */
addWords('technology', 'easy', [
  ['COMPUTER', 'Device', 'You type on it', 'Runs software'],
  ['INTERNET', 'Network', 'Connects the world', 'You browse it'],
  ['ROBOT', 'Machine', 'Can be programmed', 'Often looks mechanical'],
  ['BATTERY', 'Power source', 'Stores energy', 'Needs recharging'],
  ['CAMERA', 'Device', 'Captures images', 'Has a lens'],
  ['PRINTER', 'Device', 'Puts ink on paper', 'Connects to a computer'],
  ['HEADPHONES', 'Audio device', 'You wear them on your ears', 'Used to listen privately'],
  ['TABLET', 'Device', 'Touchscreen computer', 'Smaller than a laptop'],
  ['ROUTER', 'Networking device', 'Broadcasts WiFi', 'Sits near your modem'],
  ['DRONE', 'Flying device', 'Controlled remotely', 'Often has a camera']
]);
addWords('technology', 'medium', [
  ['ALGORITHM', 'Programming term', 'A set of steps to solve a problem', 'Used in every program'],
  ['DATABASE', 'Storage system', 'Organizes data', 'Queried with a language like SQL'],
  ['FIREWALL', 'Security system', 'Blocks unwanted traffic', 'Protects a network'],
  ['ENCRYPTION', 'Security process', 'Scrambles data', 'Needs a key to reverse'],
  ['BANDWIDTH', 'Networking term', 'Measures data capacity', 'Affects internet speed'],
  ['PROCESSOR', 'Hardware part', 'The brain of a computer', 'Also called a CPU'],
  ['BLUETOOTH', 'Wireless standard', 'Connects devices short range', 'Named after a Viking king'],
  ['SOFTWARE', 'Programs', 'Runs on hardware', 'Includes apps and operating systems'],
  ['MALWARE', 'Security threat', 'Malicious software', 'Can steal or damage data'],
  ['INTERFACE', 'Design term', 'How a user interacts with a system', 'Can be graphical or text-based']
]);
addWords('technology', 'hard', [
  ['MICROPROCESSOR', 'Hardware component', 'Integrated circuit brain', 'Found in nearly every device'],
  ['BLOCKCHAIN', 'Ledger technology', 'Distributed and immutable', 'Underlies cryptocurrencies'],
  ['CRYPTOGRAPHY', 'Security field', 'Studies secure communication', 'Uses complex mathematics'],
  ['VIRTUALIZATION', 'Computing concept', 'Runs machines inside machines', 'Used heavily in cloud computing'],
  ['MIDDLEWARE', 'Software layer', 'Connects different applications', 'Sits between OS and apps'],
  ['MULTITHREADING', 'Programming concept', 'Runs tasks concurrently', 'Improves processor efficiency'],
  ['AUTHENTICATION', 'Security process', 'Verifies identity', 'Often needs a password or token'],
  ['LATENCY', 'Networking term', 'Delay in data transfer', 'Measured in milliseconds'],
  ['KUBERNETES', 'Orchestration platform', 'Manages containers', 'Originally built by Google'],
  ['REFACTORING', 'Coding practice', 'Restructures code without changing behavior', 'Improves maintainability']
]);

/* ---------------------------- GEOGRAPHY ---------------------------- */
addWords('geography', 'easy', [
  ['RIVER', 'Landform', 'Flows to the sea', 'The Nile is one'],
  ['MOUNTAIN', 'Landform', 'Very tall and rocky', 'Everest is the tallest'],
  ['DESERT', 'Biome', 'Very dry', 'The Sahara is famous'],
  ['ISLAND', 'Landform', 'Surrounded by water', 'Hawaii is made of these'],
  ['OCEAN', 'Body of water', 'Very large and salty', 'The Pacific is the biggest'],
  ['VALLEY', 'Landform', 'Low area between hills', 'Often has a river running through'],
  ['FOREST', 'Biome', 'Full of trees', 'The Amazon is the largest'],
  ['GLACIER', 'Ice formation', 'Moves very slowly', 'Found near the poles'],
  ['CANYON', 'Landform', 'Deep and narrow', 'The Grand one is in Arizona'],
  ['PENINSULA', 'Landform', 'Surrounded by water on three sides', 'Florida is one example']
]);
addWords('geography', 'medium', [
  ['CONTINENT', 'Landmass', 'There are seven of them', 'Africa is the second largest'],
  ['EQUATOR', 'Imaginary line', 'Divides the globe in half', 'Zero degrees latitude'],
  ['ARCHIPELAGO', 'Landform', 'A chain of islands', 'The Philippines is one example'],
  ['PLATEAU', 'Landform', 'A raised flat area', 'Sometimes called a tableland'],
  ['TUNDRA', 'Biome', 'Cold and treeless', 'Found near the Arctic Circle'],
  ['DELTA', 'Landform', 'Forms where a river meets the sea', 'Often shaped like a triangle'],
  ['HEMISPHERE', 'Geographic division', 'Half of the Earth', 'Northern and Southern are examples'],
  ['SAVANNA', 'Biome', 'Grassy with scattered trees', 'Home to lions and giraffes'],
  ['FJORD', 'Landform', 'A narrow inlet with steep sides', 'Common in Norway'],
  ['ISTHMUS', 'Landform', 'A narrow strip of land', 'Connects two larger landmasses']
]);
addWords('geography', 'hard', [
  ['MERIDIAN', 'Geographic line', 'Runs from pole to pole', 'The Prime one is at zero degrees'],
  ['TECTONIC', 'Geologic term', 'Relates to Earth\'s plates', 'Causes earthquakes when plates shift'],
  ['ESTUARY', 'Landform', 'Where a river meets the tide', 'Mixes fresh and salt water'],
  ['ATOLL', 'Landform', 'A ring-shaped coral reef', 'Often encloses a lagoon'],
  ['STEPPE', 'Biome', 'Vast dry grassland', 'Common across Central Asia'],
  ['CARTOGRAPHY', 'Field of study', 'The art of making maps', 'Cartographers practice this'],
  ['SUBDUCTION', 'Geologic process', 'One plate sinks beneath another', 'Often creates deep ocean trenches'],
  ['PRECIPITATION', 'Weather term', 'Water falling from clouds', 'Includes rain, snow, and hail'],
  ['MONSOON', 'Weather pattern', 'Seasonal shift in wind', 'Brings heavy rain to South Asia'],
  ['ARCHIPELAGIC', 'Geographic term', 'Describes island nations', 'Indonesia is a prime example']
]);

/* ---------------------------- HISTORY ---------------------------- */
addWords('history', 'easy', [
  ['PYRAMID', 'Ancient structure', 'Built by the Egyptians', 'A tomb for pharaohs'],
  ['CASTLE', 'Structure', 'Home to royalty', 'Often has a moat'],
  ['KNIGHT', 'Historical figure', 'Wore armor', 'Served a king or lord'],
  ['EMPIRE', 'Political term', 'Ruled by an emperor', 'The Roman one was huge'],
  ['TREATY', 'Historical document', 'Ends a conflict', 'Signed by nations'],
  ['COLONY', 'Historical term', 'Controlled by another country', 'America once had thirteen'],
  ['REVOLUTION', 'Historical event', 'A major uprising', 'Often overthrows a government'],
  ['MONARCH', 'Ruler', 'Wears a crown', 'Rules a kingdom'],
  ['ARTIFACT', 'Historical object', 'Made by humans long ago', 'Found by archaeologists'],
  ['DYNASTY', 'Ruling family', 'Passes power through generations', 'Ancient China had many']
]);
addWords('history', 'medium', [
  ['RENAISSANCE', 'Historical period', 'A rebirth of art and learning', 'Began in Italy'],
  ['COLONIZATION', 'Historical process', 'Settling a foreign land', 'Often exploited native peoples'],
  ['INDEPENDENCE', 'Historical concept', 'Freedom from another power', 'Celebrated with a national holiday'],
  ['ARISTOCRACY', 'Social class', 'The ruling elite', 'Held power through inherited titles'],
  ['CONQUISTADOR', 'Historical figure', 'Spanish conqueror', 'Explored the Americas'],
  ['FEUDALISM', 'Social system', 'Based on land for loyalty', 'Common in medieval Europe'],
  ['INQUISITION', 'Historical institution', 'Investigated religious heresy', 'Feared for its tribunals'],
  ['ARMISTICE', 'Historical term', 'A temporary ceasefire', 'Ended World War One fighting'],
  ['EMANCIPATION', 'Historical process', 'Freedom from slavery', 'Declared by a famous proclamation'],
  ['PARLIAMENT', 'Governing body', 'Makes laws for a nation', 'Britain\'s is centuries old']
]);
addWords('history', 'hard', [
  ['HIEROGLYPHICS', 'Ancient writing', 'Used symbols and pictures', 'Found on Egyptian tombs'],
  ['MESOPOTAMIA', 'Ancient region', 'Between two rivers', 'Cradle of civilization'],
  ['ABSOLUTISM', 'Political system', 'Total power in one ruler', 'Practiced by many European kings'],
  ['ANNEXATION', 'Historical process', 'Formally adding territory', 'Often done by force'],
  ['PROTECTORATE', 'Political status', 'Controlled but not fully annexed', 'A form of indirect rule'],
  ['ISOLATIONISM', 'Political stance', 'Avoiding foreign entanglements', 'A policy some nations followed'],
  ['REPARATIONS', 'Historical term', 'Payment for wartime damage', 'Demanded after major conflicts'],
  ['SUFFRAGETTE', 'Historical figure', 'Fought for voting rights', 'Active in the early 1900s'],
  ['CONFEDERACY', 'Political union', 'A group of allied states', 'Formed during the American Civil War'],
  ['PARTITION', 'Historical event', 'Division of a territory', 'India experienced one in 1947']
]);

/* ---------------------------- SPORTS ---------------------------- */
addWords('sports', 'easy', [
  ['SOCCER', 'Sport', 'Played with a round ball', 'Called football outside the US'],
  ['TENNIS', 'Sport', 'Played with a racket', 'Uses a net and court'],
  ['HOCKEY', 'Sport', 'Played on ice or field', 'Uses a stick and puck'],
  ['BOXING', 'Sport', 'Fought with fists', 'Happens in a ring'],
  ['SWIMMING', 'Sport', 'Done in water', 'Has different strokes'],
  ['CYCLING', 'Sport', 'Done on two wheels', 'The Tour de France features it'],
  ['GOLF', 'Sport', 'Played with clubs', 'Ball goes into a hole'],
  ['WRESTLING', 'Sport', 'Grappling combat', 'Aims to pin an opponent'],
  ['ARCHERY', 'Sport', 'Uses a bow', 'Aims at a target'],
  ['ROWING', 'Sport', 'Done in a boat', 'Uses oars']
]);
addWords('sports', 'medium', [
  ['MARATHON', 'Running event', 'Over 26 miles long', 'Named after a Greek battle'],
  ['GYMNASTICS', 'Sport', 'Requires flexibility and balance', 'Includes the balance beam'],
  ['BADMINTON', 'Sport', 'Played with a shuttlecock', 'Uses a lightweight racket'],
  ['TRIATHLON', 'Sport', 'Combines three disciplines', 'Includes swimming, cycling, and running'],
  ['LACROSSE', 'Sport', 'Uses a netted stick', 'Originated with Native Americans'],
  ['DECATHLON', 'Athletic event', 'Ten different events', 'Tests all-around ability'],
  ['SNOWBOARDING', 'Winter sport', 'Done on a single board', 'Popular at the Winter Olympics'],
  ['WEIGHTLIFTING', 'Sport', 'Lifts heavy barbells', 'Includes the clean and jerk'],
  ['FENCING', 'Sport', 'Combat with swords', 'Wears a protective mask'],
  ['CURLING', 'Winter sport', 'Slides stones on ice', 'Uses brooms to sweep']
]);
addWords('sports', 'hard', [
  ['BIATHLON', 'Winter sport', 'Combines skiing and shooting', 'Requires steady nerves after exertion'],
  ['STEEPLECHASE', 'Running event', 'Includes barriers and a water jump', 'A grueling distance race'],
  ['PENTATHLON', 'Athletic event', 'Combines five disciplines', 'Includes fencing and swimming'],
  ['DRESSAGE', 'Equestrian sport', 'Horse performs precise movements', 'Often called horse ballet'],
  ['SHOT-PUT', 'Track and field event', 'Throws a heavy metal ball', 'Thrown from a small circle'],
  ['BOBSLED', 'Winter sport', 'A team races down an icy track', 'Uses a steerable sled'],
  ['POLO', 'Sport', 'Played on horseback', 'Uses a long mallet'],
  ['SEPAK-TAKRAW', 'Sport', 'Uses feet instead of hands', 'Popular in Southeast Asia'],
  ['LUGE', 'Winter sport', 'Feet-first sledding', 'One of the fastest sports on ice'],
  ['KABADDI', 'Contact sport', 'Played while holding your breath', 'Popular across South Asia']
]);

/* ---------------------------- MOVIES ---------------------------- */
addWords('movies', 'easy', [
  ['ACTOR', 'Film role', 'Performs in a movie', 'Can win an Oscar'],
  ['DIRECTOR', 'Film role', 'Guides the making of a film', 'Sits in the director\'s chair'],
  ['SCREEN', 'Movie equipment', 'Shows the picture', 'Found in a theater'],
  ['SEQUEL', 'Film term', 'Follows an earlier movie', 'Continues the story'],
  ['TRAILER', 'Film term', 'A short preview', 'Shown before the main feature'],
  ['ANIMATION', 'Film genre', 'Drawn or computer generated', 'Pixar makes these'],
  ['COMEDY', 'Film genre', 'Meant to make you laugh', 'Often has a happy ending'],
  ['SUBTITLE', 'Film feature', 'Translated text on screen', 'Helps understand foreign dialogue'],
  ['POPCORN', 'Theater snack', 'Eaten while watching movies', 'Often salty or buttery'],
  ['CAMEO', 'Film term', 'A brief celebrity appearance', 'Often a fun surprise']
]);
addWords('movies', 'medium', [
  ['SCREENPLAY', 'Film document', 'Contains dialogue and scenes', 'Written by a screenwriter'],
  ['SOUNDTRACK', 'Film element', 'The music of a movie', 'Can win its own award'],
  ['BLOCKBUSTER', 'Film term', 'A huge commercial success', 'Often released in summer'],
  ['CINEMATOGRAPHY', 'Film craft', 'The art of camera work', 'Shapes how a film looks'],
  ['PROTAGONIST', 'Film term', 'The main character', 'The story follows them'],
  ['STORYBOARD', 'Planning tool', 'Sketches out each scene', 'Used before filming begins'],
  ['DOCUMENTARY', 'Film genre', 'Based on real events', 'Aims to inform the viewer'],
  ['FRANCHISE', 'Film term', 'A series of related movies', 'Marvel is a huge one'],
  ['NARRATOR', 'Film role', 'Tells the story out loud', 'Often unseen on screen'],
  ['PREMIERE', 'Film event', 'The first public showing', 'Often has a red carpet']
]);
addWords('movies', 'hard', [
  ['MISE-EN-SCENE', 'Film term', 'Everything visible in a shot', 'French for "placing on stage"'],
  ['DENOUEMENT', 'Story term', 'The final resolution', 'Comes after the climax'],
  ['SOUNDSTAGE', 'Production location', 'A large indoor filming space', 'Used to build elaborate sets'],
  ['CHOREOGRAPHY', 'Film craft', 'Planned movement seque  { word: "ATOM", category: "Science", difficulty: "Easy", hints: ["Basic unit of matter", "Contains protons and neutrons", "Combines to form molecules"] },
  { word: "GRAVITY", category: "Science", difficulty: "Easy", hints: ["Pulls objects toward Earth", "Discovered by Isaac Newton", "Keeps planets in orbit"] },
  { word: "OXYGEN", category: "Science", difficulty: "Easy", hints: ["Gas required for human breathing", "Atomic number 8", "Makes up 21% of atmosphere"] },
  { word: "PHOTOSYNTHESIS", category: "Science", difficulty: "Medium", hints: ["Plant energy production", "Uses sunlight and CO2", "Produces oxygen as byproduct"] },
  { word: "MOLECULE", category: "Science", difficulty: "Medium", hints: ["Group of bonded atoms", "Water is H2O", "Smallest unit of chemical compound"] },
  { word: "QUANTUM", category: "Science", difficulty: "Hard", hints: ["Subatomic physics realm", "Describes discrete units of energy", "Associated with Schrödinger's cat"] },
  { word: "ENTROPY", category: "Science", difficulty: "Hard", hints: ["Measure of disorder in a system", "Second Law of Thermodynamics", "Always increases in universe"] },

  // --- TECHNOLOGY ---
  { word: "ROBOT", category: "Technology", difficulty: "Easy", hints: ["Programmable machine", "Performs automated tasks", "Often depicted as metal humans"] },
  { word: "LAPTOP", category: "Technology", difficulty: "Easy", hints: ["Portable personal computer", "Folds open with screen and keys", "Runs on rechargeable battery"] },
  { word: "INTERNET", category: "Technology", difficulty: "Easy", hints: ["Global network of computers", "Hosts the World Wide Web", "Connects billions of devices"] },
  { word: "ALGORITHM", category: "Technology", difficulty: "Medium", hints: ["Step-by-step instructions", "Basis of software programs", "Used for sorting and searching"] },
  { word: "DATABASE", category: "Technology", difficulty: "Medium", hints: ["Structured collection of data", "Queried using SQL", "Stores backend information"] },
  { word: "BLOCKCHAIN", category: "Technology", difficulty: "Hard", hints: ["Decentralized digital ledger", "Underlies cryptocurrencies", "Immutable chain of cryptographic blocks"] },
  { word: "CYBERSECURITY", category: "Technology", difficulty: "Hard", hints: ["Protection of computer systems", "Guards against hackers and malware", "Involves firewalls and encryption"] },

  // --- GEOGRAPHY ---
  { word: "ISLAND", category: "Geography", difficulty: "Easy", hints: ["Land surrounded by water", "Hawaii and Iceland are examples", "Reached by boat or plane"] },
  { word: "MOUNTAIN", category: "Geography", difficulty: "Easy", hints: ["Large natural elevation of earth", "Everest is the tallest", "Has peaks and valleys"] },
  { word: "CANAL", category: "Geography", difficulty: "Medium", hints: ["Man-made waterway", "Suez and Panama are famous", "Used for boat navigation"] },
  { word: "ARCHIPELAGO", category: "Geography", difficulty: "Hard", hints: ["Group or chain of islands", "Indonesia is the world's largest", "Formed by volcanic activity"] },
  { word: "PENINSULA", category: "Geography", difficulty: "Medium", hints: ["Land surrounded by water on 3 sides", "Florida and Italy are examples", "Connected to larger mainland"] },

  // --- HISTORY ---
  { word: "PYRAMID", category: "History", difficulty: "Easy", hints: ["Ancient Egyptian tombs", "Triangular stone structures", "Giza hosts the famous ones"] },
  { word: "SAMURAI", category: "History", difficulty: "Medium", hints: ["Ancient Japanese warrior", "Followed Bushido code", "Wielded Katana swords"] },
  { word: "RENAISSANCE", category: "History", difficulty: "Hard", hints: ["Cultural rebirth in Europe", "14th to 17th centuries", "Leonardo da Vinci period"] },
  { word: "GLADIATOR", category: "History", difficulty: "Medium", hints: ["Roman combatant", "Fought in the Colosseum", "Entertained ancient crowds"] },

  // --- SPORTS ---
  { word: "SOCCER", category: "Sports", difficulty: "Easy", hints: ["World's most popular sport", "Played with a black and white ball", "Cannot use hands except goalie"] },
  { word: "MARATHON", category: "Sports", difficulty: "Medium", hints: ["Long distance running race", "Exactly 26.2 miles long", "Named after ancient Greek city"] },
  { word: "BASKETBALL", category: "Sports", difficulty: "Easy", hints: ["Dribble and shoot into a hoop", "Invented by James Naismith", "NBA is top professional league"] },

  // --- MOVIES ---
  { word: "CINEMA", category: "Movies", difficulty: "Easy", hints: ["Place to watch movies", "Has a massive screen and popcorn", "Also called movie theater"] },
  { word: "DIRECTOR", category: "Movies", difficulty: "Medium", hints: ["Person in charge of movie set", "Yells 'Action!' and 'Cut!'", "Spielberg and Nolan are famous"] },
  { word: "BLOCKBUSTER", category: "Movies", difficulty: "Hard", hints: ["Huge box office hit movie", "Named after explosive power", "Also a defunct video rental chain"] },

  // --- SPACE ---
  { word: "GALAXY", category: "Space", difficulty: "Easy", hints: ["System of millions of stars", "The Milky Way is ours", "Contains solar systems and dust"] },
  { word: "SUPERNOVA", category: "Space", difficulty: "Medium", hints: ["Explosion of a dying star", "Creates heavy elements", "Extremely bright astronomical event"] },
  { word: "BLACKHOLE", category: "Space", difficulty: "Hard", hints: ["Gravitational pull so strong light can't escape", "Center has a singularity", "Bounded by event horizon"] },

  // --- FOOD ---
  { word: "PIZZA", category: "Food", difficulty: "Easy", hints: ["Italian flatbread with toppings", "Crust, sauce, and cheese", "Delivered in square cardboard boxes"] },
  { word: "AVOCADO", category: "Food", difficulty: "Medium", hints: ["Green fruit with large seed", "Main ingredient in guacamole", "Popular on toast"] },
  { word: "CROISSANT", category: "Food", difficulty: "Hard", hints: ["Flaky buttery French pastry", "Crescent moon shaped", "Baked to golden perfection"] },

  // --- ANIMALS ---
  { word: "DOLPHIN", category: "Animals", difficulty: "Easy", hints: ["Intelligent marine mammal", "Uses echolocation", "Known for acrobatic leaps"] },
  { word: "CHAMELEON", category: "Animals", difficulty: "Medium", hints: ["Reptile that changes color", "Has independently moving eyes", "Long sticky tongue for insects"] },
  { word: "PLATYPUS", category: "Animals", difficulty: "Hard", hints: ["Egg-laying mammal", "Duck bill and beaver tail", "Native to eastern Australia"] }
];

// Helper to expand database dynamically if needed
function getRandomWord(category, difficulty, usedWords) {
  let filtered = WORD_DATABASE.filter(item => {
    const catMatch = (category === 'Mixed') ? true : item.category === category;
    const diffMatch = (difficulty === 'Mixed') ? true : item.difficulty === difficulty;
    const notUsed = !usedWords.has(item.word);
    return catMatch && diffMatch && notUsed;
  });

  // Fallback if exhausted in specific sub-criteria
  if (filtered.length === 0) {
    filtered = WORD_DATABASE.filter(item => !usedWords.has(item.word));
  }
  // Ultimate fallback if all words used
  if (filtered.length === 0) {
    usedWords.clear();
    filtered = WORD_DATABASE;
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  usedWords.add(selected.word);
  return selected;
}

// ============================================================================
// 2. IN-MEMORY GAME STATE MANAGEMENT
// ============================================================================
const rooms = new Map();

class Room {
  constructor(code, hostId, settings) {
    this.code = code;
    this.hostId = hostId;
    this.settings = {
      rounds: parseInt(settings.rounds) || 5,
      timePerRound: parseInt(settings.timePerRound) || 45,
      maxPlayers: parseInt(settings.maxPlayers) || 8,
      difficulty: settings.difficulty || 'Mixed',
      category: settings.category || 'Mixed'
    };
    this.players = new Map(); // socketId -> Player
    this.state = 'LOBBY'; // LOBBY, PLAYING, ROUND_OVER, GAME_OVER
    this.currentRound = 0;
    this.currentWordData = null;
    this.usedWords = new Set();
    this.timer = null;
    this.timeLeft = 0;
    this.roundStartTime = 0;
  }

  addPlayer(socketId, name) {
    const isHost = this.players.size === 0;
    const player = {
      id: socketId,
      name: name,
      isHost: isHost,
      score: 0,
      lives: 3,
      hintsUnlocked: 1, // 1, 2, or 3
      correctLetters: 0,
      correctWords: 0,
      totalGuesses: 0,
      wrongGuesses: 0,
      roundsWon: 0,
      guessedLetters: new Set(),
      hasGuessedWord: false,
      lastGuessTime: 0, // Anti-spam rate limiting
      fastestGuess: null
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.players.size > 0 && this.hostId === socketId) {
      // Migrate host to first remaining player
      const nextHost = this.players.values().next().value;
      nextHost.isHost = true;
      this.hostId = nextHost.id;
    }
  }

  isNameTaken(name) {
    for (let p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) return true;
    }
    return false;
  }

  getPublicPlayerList() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      score: p.score,
      lives: p.lives,
      hasGuessedWord: p.hasGuessedWord,
      correctLetters: p.correctLetters,
      correctWords: p.correctWords,
      roundsWon: p.roundsWon,
      accuracy: p.totalGuesses > 0 ? Math.round(((p.totalGuesses - p.wrongGuesses) / p.totalGuesses) * 100) : 100
    })).sort((a,b) => b.score - a.score);
  }

  startNewRound() {
    this.currentRound++;
    this.state = 'PLAYING';
    this.currentWordData = getRandomWord(this.settings.category, this.settings.difficulty, this.usedWords);
    this.timeLeft = this.settings.timePerRound;
    this.roundStartTime = Date.now();

    // Reset round-specific player state
    for (let p of this.players.values()) {
      p.lives = 3;
      p.hintsUnlocked = 1;
      p.guessedLetters.clear();
      p.hasGuessedWord = false;
    }
  }

  getMaskedWord() {
    if (!this.currentWordData) return "";
    const word = this.currentWordData.word;
    let masked = "";
    // Reveal letters if ANY active player guessed it or if round over
    for (let char of word) {
      let isRevealed = false;
      if (this.state === 'ROUND_OVER' || this.state === 'GAME_OVER') {
        isRevealed = true;
      } else {
        for (let p of this.players.values()) {
          if (p.guessedLetters.has(char)) {
            isRevealed = true;
            break;
          }
        }
      }
      masked += isRevealed ? char : "_";
    }
    return masked;
  }

  checkAllPlayersDone() {
    let activePlayers = 0;
    let finishedPlayers = 0;

    for (let p of this.players.values()) {
      activePlayers++;
      if (p.lives <= 0 || p.hasGuessedWord) {
        finishedPlayers++;
      }
    }
    return activePlayers > 0 && finishedPlayers === activePlayers;
  }
}

// Helper to generate 6-character room codes
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// 3. SERVER CONTROLLER & SOCKET.IO EVENTS
// ============================================================================

io.on('connection', (socket) => {

  // Create Room
  socket.on('create_room', ({ name, settings }, callback) => {
    if (!name || name.trim().length === 0) {
      return callback({ success: false, error: "Display name is required" });
    }
    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();

    const room = new Room(code, socket.id, settings);
    const player = room.addPlayer(socket.id, name.trim());
    rooms.set(code, room);

    socket.join(code);
    socket.roomCode = code;

    callback({
      success: true,
      code: code,
      player: player,
      settings: room.settings
    });

    io.to(code).emit('lobby_update', {
      players: room.getPublicPlayerList(),
      settings: room.settings,
      hostId: room.hostId
    });
  });

  // Join Room
  socket.on('join_room', ({ name, code }, callback) => {
    code = code.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, error: "Room not found. Check your code." });
    }
    if (room.state !== 'LOBBY') {
      return callback({ success: false, error: "Game is already in progress." });
    }
    if (room.players.size >= room.settings.maxPlayers) {
      return callback({ success: false, error: "Room is full." });
    }
    if (room.isNameTaken(name.trim())) {
      return callback({ success: false, error: "This name is already taken in this room." });
    }

    const player = room.addPlayer(socket.id, name.trim());
    socket.join(code);
    socket.roomCode = code;

    callback({
      success: true,
      code: code,
      player: player,
      settings: room.settings
    });

    io.to(code).emit('lobby_update', {
      players: room.getPublicPlayerList(),
      settings: room.settings,
      hostId: room.hostId
    });
  });

  // Start Game (Host only)
  socket.on('start_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostId !== socket.id || room.state !== 'LOBBY') return;

    runGameRoundLoop(room);
  });

  // Handle Guesses (Anti-Cheat & Rate Limited)
  socket.on('submit_guess', ({ guess }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'PLAYING') return;

    const player = room.players.get(socket.id);
    if (!player || player.lives <= 0 || player.hasGuessedWord) return;

    // Rate limiting: 300ms between inputs
    const now = Date.now();
    if (now - player.lastGuessTime < 300) return;
    player.lastGuessTime = now;

    guess = guess.toUpperCase().trim();
    if (!guess || !/^[A-Z]+$/.test(guess)) return;

    const targetWord = room.currentWordData.word;
    player.totalGuesses++;

    // SINGLE LETTER GUESS
    if (guess.length === 1) {
      if (player.guessedLetters.has(guess)) {
        socket.emit('guess_result', { status: 'DUPLICATE', message: 'Letter already guessed!' });
        return;
      }

      player.guessedLetters.add(guess);

      if (targetWord.includes(guess)) {
        // CORRECT LETTER
        let occurences = 0;
        for (let char of targetWord) if (char === guess) occurences++;
        
        player.score += 1 * occurences;
        player.correctLetters += occurences;

        io.to(room.code).emit('letter_revealed', {
          maskedWord: room.getMaskedWord(),
          guessedBy: player.name,
          letter: guess,
          players: room.getPublicPlayerList()
        });

        // Check if this letter completes the word for everyone
        if (!room.getMaskedWord().includes('_')) {
          handleRoundEnd(room, player, "WORD_COMPLETED");
        }

      } else {
        // WRONG LETTER
        player.wrongGuesses++;
        player.lives--;

        if (player.lives === 2) {
          player.hintsUnlocked = 2;
          socket.emit('private_hint', { hintIndex: 2, hint: room.currentWordData.hints[1] });
        } else if (player.lives === 1) {
          player.hintsUnlocked = 3;
          socket.emit('private_hint', { hintIndex: 3, hint: room.currentWordData.hints[2] });
        }

        socket.emit('guess_result', {
          status: 'WRONG_LETTER',
          lives: player.lives,
          message: `Letter '${guess}' is incorrect!`
        });

        io.to(room.code).emit('player_status_update', { players: room.getPublicPlayerList() });

        if (room.checkAllPlayersDone()) {
          handleRoundEnd(room, null, "ALL_DEAD");
        }
      }
    } 
    // FULL WORD GUESS
    else {
      if (guess === targetWord) {
        // CORRECT FULL WORD
        const timeTaken = Math.round((Date.now() - room.roundStartTime) / 1000);
        
        // Dynamic scoring calculation
        let basePoints = 10;
        if (player.hintsUnlocked === 2) basePoints = 8;
        if (player.hintsUnlocked === 3) basePoints = 6;
        
        let speedBonus = Math.max(0, 5 - Math.floor(timeTaken / 5)); // Bonus for fast guess
        let totalGain = basePoints + speedBonus;

        player.score += totalGain;
        player.correctWords++;
        player.hasGuessedWord = true;
        player.roundsWon++;

        if (!player.fastestGuess || timeTaken < player.fastestGuess) {
          player.fastestGuess = timeTaken;
        }

        // Reveal all letters
        for (let char of targetWord) player.guessedLetters.add(char);

        handleRoundEnd(room, player, "WORD_GUESSED");
      } else {
        // WRONG WORD GUESS
        player.wrongGuesses++;
        player.lives--;

        if (player.lives === 2) {
          player.hintsUnlocked = 2;
          socket.emit('private_hint', { hintIndex: 2, hint: room.currentWordData.hints[1] });
        } else if (player.lives === 1) {
          player.hintsUnlocked = 3;
          socket.emit('private_hint', { hintIndex: 3, hint: room.currentWordData.hints[2] });
        }

        socket.emit('guess_result', {
          status: 'WRONG_WORD',
          lives: player.lives,
          message: `"${guess}" is incorrect!`
        });

        io.to(room.code).emit('player_status_update', { players: room.getPublicPlayerList() });

        if (room.checkAllPlayersDone()) {
          handleRoundEnd(room, null, "ALL_DEAD");
        }
      }
    }
  });

  // Return to Lobby / Play Again
  socket.on('restart_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostId !== socket.id) return;

 
