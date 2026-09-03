/**
 * Frontend-only sportsbook fixtures used while the UI is a visual showcase.
 *
 * Objects are already in the shape `mapFixtureToMatch` returns so they can be
 * dropped straight into `useMatches` without touching the mappers. Kickoffs are
 * generated relative to load time so the 0-15M / 15-30M / 30-60M segments and
 * the calendar-day filters all have something to show.
 *
 * Placing a bet against these ids will be rejected by the backend — flip
 * `USE_MOCK_DATA` in `useMatches.js` to go back to live fixtures.
 */
import { SPORTSBOOK_TIMEZONE } from "../utils/sportsbookDay.js";

let nextFixtureId = 900_000;

function formatDateForUi(date) {
  const datePart = date.toLocaleDateString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const year = date.toLocaleDateString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    year: "numeric",
  });
  return `${datePart} ${timePart} ${year}`;
}

function odd(value) {
  return value == null ? null : Number(value).toFixed(2);
}

/** Derive plausible double-chance prices from the 1-X-2 line. */
function doubleChance(home, draw, away) {
  const inv = (a, b) => 1 / (1 / a + 1 / b);
  return {
    "1x": odd(inv(home, draw) * 1.06),
    12: odd(inv(home, away) * 1.06),
    x2: odd(inv(draw, away) * 1.06),
  };
}

function buildDetailedOdds({ home, draw, away, dc, homeTeam, awayTeam }) {
  const main = [
    {
      category: "Match Winner",
      odds: [
        { id: "1", value: odd(home) },
        ...(draw ? [{ id: "x", value: odd(draw) }] : []),
        { id: "2", value: odd(away) },
      ],
    },
  ];

  if (dc) {
    main.push({
      category: "Double Chance",
      odds: [
        { id: "1X", value: dc["1x"] },
        { id: "12", value: dc["12"] },
        { id: "X2", value: dc.x2 },
      ],
    });
  }

  const extra = [
    {
      category: "Both Teams To Score",
      odds: [
        { id: "Yes", value: odd(1.62) },
        { id: "No", value: odd(2.15) },
      ],
    },
    {
      category: "Goals Over/Under",
      odds: [
        { id: "Over 1.5", value: odd(1.28) },
        { id: "Under 1.5", value: odd(3.45) },
        { id: "Over 2.5", value: odd(1.85) },
        { id: "Under 2.5", value: odd(1.92) },
        { id: "Over 3.5", value: odd(3.1) },
        { id: "Under 3.5", value: odd(1.34) },
      ],
    },
    {
      category: "Draw No Bet",
      odds: [
        { id: "1", value: odd(home * 0.78) },
        { id: "2", value: odd(away * 0.78) },
      ],
    },
    {
      category: "First Team To Score",
      odds: [
        { id: homeTeam, value: odd(1.74) },
        { id: awayTeam, value: odd(2.05) },
        { id: "No Goal", value: odd(11.0) },
      ],
    },
  ];

  return { main, extra };
}

/**
 * @param {object} spec
 * @param {number} spec.inMinutes — kickoff offset from now
 */
function mk({
  sportId,
  sportName,
  country,
  league,
  leagueRank = 50,
  homeTeam,
  awayTeam,
  home,
  draw = null,
  away,
  inMinutes,
  status = "NS",
  homeScore = null,
  awayScore = null,
  livePeriod = null,
  liveMinute = null,
}) {
  const apiFixtureId = (nextFixtureId += 1);
  const kickoff = new Date(Date.now() + inMinutes * 60_000);
  const dc = draw ? doubleChance(home, draw, away) : null;

  return {
    id: `fx-${apiFixtureId}`,
    apiFixtureId,
    apiLeagueId: leagueRank,
    leagueRank,
    league: `${country} - ${league}`,
    match: `${homeTeam} V ${awayTeam}`,
    homeTeam,
    awayTeam,
    date: formatDateForUi(kickoff),
    kickoffAt: kickoff.toISOString(),
    sportId,
    sportName,
    status,
    homeScore,
    awayScore,
    livePeriod,
    liveMinute,
    countryFlag: null,
    leagueLogo: null,
    homeTeamLogo: null,
    awayTeamLogo: null,
    markets: [
      { id: "1", value: odd(home) },
      { id: "x", value: draw ? odd(draw) : null },
      { id: "2", value: odd(away) },
      { id: "1x", value: dc?.["1x"] ?? null },
      { id: "x2", value: dc?.x2 ?? null },
      { id: "12", value: dc?.["12"] ?? null },
    ],
    sideBets: 40 + ((apiFixtureId * 7) % 60),
    detailedOdds: buildDetailedOdds({
      home,
      draw,
      away,
      dc,
      homeTeam,
      awayTeam,
    }),
  };
}

const FOOTBALL = { sportId: "football", sportName: "Football" };
const BASKETBALL = { sportId: "basketball", sportName: "Basketball" };
const TENNIS = { sportId: "tennis", sportName: "Tennis" };
const VOLLEYBALL = { sportId: "volleyball", sportName: "Volleyball" };
const TABLE_TENNIS = { sportId: "table-tennis", sportName: "Table Tennis" };
const CRICKET = { sportId: "cricket", sportName: "Cricket" };

/** Built once per page load so kickoff offsets stay stable while browsing. */
export const mockPrematchMatches = Object.freeze([
  mk({
    ...FOOTBALL,
    country: "Australia",
    league: "NPL Tasmania",
    leagueRank: 40,
    homeTeam: "Launceston City FC",
    awayTeam: "Clarence Zebras FC",
    home: 1.76,
    draw: 4.1,
    away: 3.45,
    inMinutes: 8,
  }),
  mk({
    ...FOOTBALL,
    country: "England",
    league: "Premier League",
    leagueRank: 1,
    homeTeam: "Arsenal",
    awayTeam: "Aston Villa",
    home: 1.55,
    draw: 4.2,
    away: 5.6,
    inMinutes: 12,
  }),
  mk({
    ...FOOTBALL,
    country: "England",
    league: "Premier League",
    leagueRank: 1,
    homeTeam: "Brighton",
    awayTeam: "Everton",
    home: 2.05,
    draw: 3.4,
    away: 3.6,
    inMinutes: 22,
  }),
  mk({
    ...FOOTBALL,
    country: "England",
    league: "Premier League",
    leagueRank: 1,
    homeTeam: "Newcastle United",
    awayTeam: "Fulham",
    home: 1.82,
    draw: 3.75,
    away: 4.2,
    inMinutes: 46,
  }),
  mk({
    ...FOOTBALL,
    country: "Spain",
    league: "La Liga",
    leagueRank: 2,
    homeTeam: "Real Betis",
    awayTeam: "Sevilla",
    home: 2.35,
    draw: 3.2,
    away: 3.05,
    inMinutes: 18,
  }),
  mk({
    ...FOOTBALL,
    country: "Spain",
    league: "La Liga",
    leagueRank: 2,
    homeTeam: "Villarreal",
    awayTeam: "Getafe",
    home: 1.68,
    draw: 3.9,
    away: 4.8,
    inMinutes: 52,
  }),
  mk({
    ...FOOTBALL,
    country: "Spain",
    league: "La Liga",
    leagueRank: 2,
    homeTeam: "Athletic Bilbao",
    awayTeam: "Real Sociedad",
    home: 2.15,
    draw: 3.3,
    away: 3.4,
    inMinutes: 190,
  }),
  mk({
    ...FOOTBALL,
    country: "Italy",
    league: "Serie A",
    leagueRank: 3,
    homeTeam: "Lazio",
    awayTeam: "Torino",
    home: 1.72,
    draw: 3.6,
    away: 4.9,
    inMinutes: 27,
  }),
  mk({
    ...FOOTBALL,
    country: "Italy",
    league: "Serie A",
    leagueRank: 3,
    homeTeam: "Bologna",
    awayTeam: "Udinese",
    home: 1.95,
    draw: 3.35,
    away: 4.0,
    inMinutes: 300,
  }),
  mk({
    ...FOOTBALL,
    country: "Germany",
    league: "Bundesliga",
    leagueRank: 4,
    homeTeam: "Eintracht Frankfurt",
    awayTeam: "Werder Bremen",
    home: 1.62,
    draw: 4.35,
    away: 4.6,
    inMinutes: 55,
  }),
  mk({
    ...FOOTBALL,
    country: "Germany",
    league: "Bundesliga",
    leagueRank: 4,
    homeTeam: "Stuttgart",
    awayTeam: "Mainz 05",
    home: 1.58,
    draw: 4.5,
    away: 5.1,
    inMinutes: 1_500,
  }),
  mk({
    ...FOOTBALL,
    country: "France",
    league: "Ligue 1",
    leagueRank: 5,
    homeTeam: "Lille",
    awayTeam: "Nice",
    home: 2.1,
    draw: 3.3,
    away: 3.5,
    inMinutes: 1_620,
  }),
  mk({
    ...FOOTBALL,
    country: "Europe",
    league: "UEFA Champions League",
    leagueRank: 0,
    homeTeam: "Inter",
    awayTeam: "Benfica",
    home: 1.66,
    draw: 3.95,
    away: 4.75,
    inMinutes: 2_900,
  }),
  mk({
    ...BASKETBALL,
    country: "USA",
    league: "NBA",
    leagueRank: 10,
    homeTeam: "Boston Celtics",
    awayTeam: "Miami Heat",
    home: 1.44,
    away: 2.75,
    inMinutes: 14,
  }),
  mk({
    ...BASKETBALL,
    country: "USA",
    league: "NBA",
    leagueRank: 10,
    homeTeam: "Denver Nuggets",
    awayTeam: "Phoenix Suns",
    home: 1.62,
    away: 2.3,
    inMinutes: 38,
  }),
  mk({
    ...BASKETBALL,
    country: "Spain",
    league: "Liga ACB",
    leagueRank: 12,
    homeTeam: "Real Madrid",
    awayTeam: "Baskonia",
    home: 1.25,
    away: 3.95,
    inMinutes: 1_200,
  }),
  mk({
    ...TENNIS,
    country: "ATP",
    league: "Cincinnati Masters",
    leagueRank: 15,
    homeTeam: "C. Alcaraz",
    awayTeam: "A. Zverev",
    home: 1.48,
    away: 2.62,
    inMinutes: 9,
  }),
  mk({
    ...TENNIS,
    country: "WTA",
    league: "Cincinnati Open",
    leagueRank: 16,
    homeTeam: "I. Swiatek",
    awayTeam: "C. Gauff",
    home: 1.72,
    away: 2.1,
    inMinutes: 33,
  }),
  mk({
    ...TENNIS,
    country: "ATP",
    league: "Challenger Prague",
    leagueRank: 18,
    homeTeam: "J. Lehecka",
    awayTeam: "T. Machac",
    home: 2.05,
    away: 1.78,
    inMinutes: 480,
  }),
  mk({
    ...VOLLEYBALL,
    country: "Italy",
    league: "SuperLega",
    leagueRank: 20,
    homeTeam: "Perugia",
    awayTeam: "Trentino",
    home: 1.55,
    away: 2.45,
    inMinutes: 25,
  }),
  mk({
    ...VOLLEYBALL,
    country: "Poland",
    league: "PlusLiga",
    leagueRank: 21,
    homeTeam: "Zaksa",
    awayTeam: "Jastrzebski",
    home: 2.2,
    away: 1.68,
    inMinutes: 1_320,
  }),
  mk({
    ...TABLE_TENNIS,
    country: "Czech Republic",
    league: "TT Cup",
    leagueRank: 30,
    homeTeam: "M. Bartos",
    awayTeam: "P. Nesvorny",
    home: 1.85,
    away: 1.9,
    inMinutes: 6,
  }),
  mk({
    ...TABLE_TENNIS,
    country: "Czech Republic",
    league: "TT Cup",
    leagueRank: 30,
    homeTeam: "R. Vavra",
    awayTeam: "J. Sucharda",
    home: 1.62,
    away: 2.25,
    inMinutes: 41,
  }),
  mk({
    ...CRICKET,
    country: "India",
    league: "Indian Premier League",
    leagueRank: 25,
    homeTeam: "Mumbai Indians",
    awayTeam: "Chennai Super Kings",
    home: 1.92,
    away: 1.88,
    inMinutes: 620,
  }),
  mk({
    ...CRICKET,
    country: "England",
    league: "The Hundred",
    leagueRank: 26,
    homeTeam: "Oval Invincibles",
    awayTeam: "Trent Rockets",
    home: 1.7,
    away: 2.12,
    inMinutes: 2_100,
  }),
]);

/** In-play fixtures for the Live tab and the home Live preview. */
export const mockLiveMatches = Object.freeze([
  mk({
    ...FOOTBALL,
    country: "Virtual",
    league: "Premier League Virtual",
    leagueRank: 1,
    homeTeam: "Brighton and Hove Albion Virtual",
    awayTeam: "Coventry City Virtual",
    home: 1.45,
    draw: 4.5,
    away: 8.0,
    inMinutes: -12,
    status: "1H",
    homeScore: 0,
    awayScore: 0,
    livePeriod: "1st Half",
    liveMinute: 12,
  }),
  mk({
    ...FOOTBALL,
    country: "Brazil",
    league: "Serie A",
    leagueRank: 8,
    homeTeam: "Palmeiras",
    awayTeam: "Flamengo",
    home: 2.4,
    draw: 3.1,
    away: 3.0,
    inMinutes: -34,
    status: "1H",
    homeScore: 1,
    awayScore: 0,
    livePeriod: "1st Half",
    liveMinute: 34,
  }),
  mk({
    ...FOOTBALL,
    country: "Japan",
    league: "J1 League",
    leagueRank: 9,
    homeTeam: "Kashima Antlers",
    awayTeam: "Urawa Reds",
    home: 3.2,
    draw: 3.4,
    away: 2.15,
    inMinutes: -58,
    status: "2H",
    homeScore: 1,
    awayScore: 2,
    livePeriod: "2nd Half",
    liveMinute: 58,
  }),
  mk({
    ...BASKETBALL,
    country: "USA",
    league: "NBA",
    leagueRank: 10,
    homeTeam: "Golden State Warriors",
    awayTeam: "LA Lakers",
    home: 1.68,
    away: 2.2,
    inMinutes: -22,
    status: "Q2",
    homeScore: 44,
    awayScore: 39,
    livePeriod: "Quarter 2",
    liveMinute: 22,
  }),
  mk({
    ...TENNIS,
    country: "ATP",
    league: "Cincinnati Masters",
    leagueRank: 15,
    homeTeam: "D. Medvedev",
    awayTeam: "H. Rune",
    home: 1.55,
    away: 2.4,
    inMinutes: -46,
    status: "LIVE",
    homeScore: 1,
    awayScore: 0,
    livePeriod: "Set 2",
    liveMinute: 46,
  }),
  mk({
    ...TABLE_TENNIS,
    country: "Czech Republic",
    league: "TT Cup",
    leagueRank: 30,
    homeTeam: "L. Vrablik",
    awayTeam: "D. Kubes",
    home: 1.75,
    away: 2.0,
    inMinutes: -8,
    status: "LIVE",
    homeScore: 1,
    awayScore: 1,
    livePeriod: "Set 3",
    liveMinute: 8,
  }),
]);

/** Public InOut icon CDN — same host the home quick-play tiles already use. */
const ICON = "https://icons.inout.games";

function tile(id, title, provider, icon) {
  return { id, title, provider, iconUrl: `${ICON}/${icon}` };
}

export const mockCasinoRails = Object.freeze([
  {
    id: "trending",
    titleKey: "casino.trending",
    overflow: 7402,
    games: [
      tile("keno-36", "Keno", "InOut", "io_keno.png"),
      tile("chicken-road-2", "Chicken Road 2", "InOut", "io_chiken-road-2.png"),
      tile("chicken-coin", "Chicken Coin", "InOut", "io_chicken_coin.png"),
      tile("megablock", "Mega Block", "InOut", "io_megablock.png"),
      tile("crash", "Crash", "InOut", "io_crash.png"),
      tile("plinko", "Plinko", "InOut", "io_plinko.png"),
      tile("mines", "Mines", "InOut", "io_mines.png"),
      tile("limbo", "Limbo", "InOut", "io_limbo.png"),
      tile("wheel", "Wheel", "InOut", "io_wheel.png"),
      tile("coinflip", "Coin Flip", "InOut", "io_coinflip.png"),
      tile("frog-jump", "Frog Jump", "InOut", "io_frog-jump.png"),
      tile("wheel-out", "Wheel Out", "InOut", "io_wheel-out.png"),
      tile("chicken-shoot", "Chicken Shoot", "InOut", "io_chicken-shoot.png"),
      tile("chicken-banana", "Chicken Banana", "InOut", "io_chicken-banana.png"),
      tile("chicken-royal", "Chicken Royal", "InOut", "io_chicken_royal.png"),
      tile("jumper", "Jumper", "InOut", "io_jumper.png"),
    ],
  },
  {
    id: "casino-games",
    titleKey: "casino.casinoGames",
    overflow: 7402,
    games: [
      tile("chicky", "Chicken Road 2", "InOut", "io_chiken-road-2.png"),
      tile("tower", "Tower", "InOut", "io_tower.png"),
      tile("stairs", "Stairs", "InOut", "io_stairs.png"),
      tile("double", "Double", "InOut", "io_double.png"),
      tile("goblin-tower", "Goblin Tower", "InOut", "io_goblin-tower.png"),
      tile("bubbles", "Bubbles", "InOut", "io_bubbles.png"),
      tile("triple", "Triple", "InOut", "io_triple.png"),
      tile("diver", "Diver", "InOut", "io_diver.png"),
      tile("ballonix", "BalloniX", "InOut", "io_ballonix.png"),
      tile("forest-arrow", "Forest Arrow", "InOut", "io_forest-arrow.png"),
      tile("rps", "Rock Paper Scissors", "InOut", "io_rock-paper-scissors.png"),
      tile("jogo-do-bicho", "Jogo Do Bicho", "InOut", "io_jogo-do-bicho.png"),
      tile("sugar-daddy", "Sugar Daddy", "InOut", "io_sugar-daddy.png"),
      tile("cryptos", "Cryptos", "InOut", "io_cryptos.png"),
      tile("joker-pyre", "Joker Pyre", "InOut", "io_joker_pyre.png"),
    ],
  },
  {
    id: "live-casino",
    titleKey: "casino.liveCasino",
    overflow: 161,
    games: [
      tile("roulette", "Roulette", "InOut", "io_roulette.png"),
      tile("crash-live", "Crash", "InOut", "io_crash.png"),
      tile("wheel-live", "Wheel", "InOut", "io_wheel.png"),
      tile("keno-live", "Keno", "InOut", "io_keno.png"),
      tile("wheel-out-live", "Wheel Out", "InOut", "io_wheel-out.png"),
      tile("avia-fly", "Avia Fly", "InOut", "io_aviafly.png"),
      tile("penalty-cup", "Penalty Nations Cup", "InOut", "io_penalty-nations-cup.png"),
      tile("plinko-1000", "Plinko 1000", "InOut", "io_plinko1000.png"),
      tile("lucky-mines", "Lucky Mines", "InOut", "io_lucky-mines.png"),
      tile("hot-mines", "Hot Mines", "InOut", "io_hot-mines.png"),
      tile("mine-slot", "Mine Slot", "InOut", "io_mineslot.png"),
      tile("twist", "Twist", "InOut", "io_twist.png"),
    ],
  },
  {
    id: "popular-games",
    titleKey: "casino.popularGames",
    overflow: 96,
    games: [
      tile("plinko-pop", "Plinko", "InOut", "io_plinko.png"),
      tile("mines-pop", "Mines", "InOut", "io_mines.png"),
      tile("chicken-pop", "Chicken Coin", "InOut", "io_chicken_coin.png"),
      tile("mega-pop", "Mega Block", "InOut", "io_megablock.png"),
      tile("chicken-road-pop", "Chicken Road", "InOut", "io_chicken-road.png"),
      tile("chicken-gold", "Chicken Road Gold", "InOut", "io_chicken-road-gold.png"),
      tile("cricket-road", "Cricket Road", "InOut", "io_cricket-road.png"),
      tile("rabbit-road", "Rabbit Road", "InOut", "io_rabbit-road.png"),
      tile("hamster-run", "Hamster Run", "InOut", "io_hamster-run.png"),
      tile("fish-boom", "Fish Boom", "InOut", "io_fish-boom.png"),
      tile("pengu-sport", "Pengu Sport", "InOut", "io_pengu-sport.png"),
      tile("topo-mole", "Topo Mole", "InOut", "io_topo-mole.png"),
      tile("chicken-shoot-pop", "Chicken Shoot", "InOut", "io_chicken-shoot.png"),
      tile("chicken-banana-pop", "Chicken Banana", "InOut", "io_chicken-banana.png"),
    ],
  },
  {
    id: "new-games",
    titleKey: "casino.newGames",
    overflow: 232,
    games: [
      tile("frog-jump-new", "Frog Jump", "InOut", "io_frog-jump.png"),
      tile("wheel-out-new", "Wheel Out", "InOut", "io_wheel-out.png"),
      tile("joker-pyre-new", "Joker Pyre", "InOut", "io_joker_pyre.png"),
      tile("squid-gamebler", "Squid Gamebler", "InOut", "io_squid-gamebler.png"),
      tile("jumper-new", "Jumper", "InOut", "io_jumper.png"),
      tile("twist-new", "Twist", "InOut", "io_twist.png"),
      tile("chicken-royal-new", "Chicken Royal", "InOut", "io_chicken_royal.png"),
      tile("penalty-new", "Penalty Nations Cup", "InOut", "io_penalty-nations-cup.png"),
      tile("mine-slot-new", "Mine Slot", "InOut", "io_mineslot.png"),
      tile("plinko-1000-new", "Plinko 1000", "InOut", "io_plinko1000.png"),
      tile("goblin-new", "Goblin Tower", "InOut", "io_goblin-tower.png"),
      tile("diver-new", "Diver", "InOut", "io_diver.png"),
    ],
  },
]);

/** Promoted accumulators shown under desktop "Multiple Of The Day". */
export const mockMultipleOfTheDay = Object.freeze([
  {
    id: "mod-ticket-1",
    title: "Football. Matchday Match Result",
    bonusPercent: 20,
    legs: [
      {
        id: "mod-1-1",
        match: "Arsenal V Aston Villa",
        market: "Match Result — Arsenal",
        value: "1.55",
        date: "04 Sep 17:00",
      },
      {
        id: "mod-1-2",
        match: "Real Betis V Sevilla",
        market: "Both Teams To Score — Yes",
        value: "1.62",
        date: "04 Sep 19:30",
      },
      {
        id: "mod-1-3",
        match: "Inter V Benfica",
        market: "Goals Over 2.5",
        value: "1.85",
        date: "04 Sep 22:00",
      },
      {
        id: "mod-1-4",
        match: "Lille V Lyon",
        market: "Match Result — Lille",
        value: "2.10",
        date: "05 Sep 16:00",
      },
      {
        id: "mod-1-5",
        match: "Porto V Sporting",
        market: "Match Result — Porto",
        value: "1.92",
        date: "05 Sep 21:15",
      },
    ],
  },
  {
    id: "mod-ticket-2",
    title: "Football. Matchday Both Teams To Score",
    bonusPercent: 13,
    legs: [
      {
        id: "mod-2-1",
        match: "FC Copenhagen V FC Nordsjaelland",
        market: "Both Teams To Score — Yes",
        value: "1.35",
        date: "03 Sep 21:00",
      },
      {
        id: "mod-2-2",
        match: "RSC Anderlecht V KV Kortrijk",
        market: "Both Teams To Score — Yes",
        value: "1.65",
        date: "03 Sep 21:30",
      },
      {
        id: "mod-2-3",
        match: "Toulouse V Lille OSC",
        market: "Both Teams To Score — Yes",
        value: "1.75",
        date: "03 Sep 21:45",
      },
      {
        id: "mod-2-4",
        match: "Real Sociedad V Celta de Vigo",
        market: "Both Teams To Score — Yes",
        value: "1.78",
        date: "03 Sep 22:00",
      },
      {
        id: "mod-2-5",
        match: "RSC Anderlecht V KRC Genk",
        market: "Both Teams To Score — Yes",
        value: "1.77",
        date: "03 Sep 22:15",
      },
    ],
  },
  {
    id: "mod-ticket-3",
    title: "Football. Matchday Goals Over 2.5",
    bonusPercent: 10,
    legs: [
      {
        id: "mod-3-1",
        match: "Bayern V Dortmund",
        market: "Goals Over 2.5",
        value: "1.48",
        date: "04 Sep 19:30",
      },
      {
        id: "mod-3-2",
        match: "PSG V Marseille",
        market: "Goals Over 2.5",
        value: "1.52",
        date: "04 Sep 21:00",
      },
      {
        id: "mod-3-3",
        match: "Barcelona V Atletico",
        market: "Goals Over 2.5",
        value: "1.70",
        date: "05 Sep 18:00",
      },
      {
        id: "mod-3-4",
        match: "Liverpool V Tottenham",
        market: "Goals Over 2.5",
        value: "1.61",
        date: "05 Sep 17:30",
      },
    ],
  },
]);
