import { describe, expect, it } from "vitest";
import {
  buildMultipleOfTheDayTickets,
  ticketToSlipSelections,
} from "./multipleOfTheDay.js";

const NOW = new Date("2026-09-03T08:00:00.000Z");

function match({
  id,
  home,
  away,
  kickoffAt,
  leagueRank = 10,
  sportId = "football",
  status = "NS",
  homeOdd = "1.55",
  awayOdd = "5.20",
  drawOdd = "3.80",
} = {}) {
  return {
    id: `fx-${id}`,
    apiFixtureId: id,
    sportId,
    status,
    leagueRank,
    league: "England - Premier League",
    match: `${home} V ${away}`,
    homeTeam: home,
    awayTeam: away,
    kickoffAt,
    markets: [
      { id: "1", value: homeOdd },
      { id: "x", value: drawOdd },
      { id: "2", value: awayOdd },
    ],
  };
}

function upcoming(id, home, extra = {}) {
  const hour = 12 + (id % 8);
  return match({
    id,
    home,
    away: `Away ${id}`,
    kickoffAt: `2026-09-03T${String(hour).padStart(2, "0")}:00:00.000Z`,
    ...extra,
  });
}

describe("buildMultipleOfTheDayTickets", () => {
  it("returns no tickets when fewer than three priced football matches remain", () => {
    expect(
      buildMultipleOfTheDayTickets(
        [upcoming(1, "Arsenal"), upcoming(2, "Liverpool")],
        { now: NOW },
      ),
    ).toEqual([]);
  });

  it("skips live, finished, non-football, and kicked-off matches", () => {
    const pool = [
      upcoming(1, "Arsenal"),
      upcoming(2, "Liverpool", { status: "LIVE" }),
      upcoming(3, "Chelsea", { sportId: "tennis" }),
      upcoming(4, "Spurs", { kickoffAt: "2026-09-03T07:00:00.000Z" }),
      upcoming(5, "City"),
      upcoming(6, "United"),
    ];
    const tickets = buildMultipleOfTheDayTickets(pool, { now: NOW });
    expect(tickets).toHaveLength(1);
    expect(tickets[0].legs.map((leg) => leg.matchName)).toEqual([
      "Arsenal V Away 1",
      "City V Away 5",
      "United V Away 6",
    ]);
  });

  it("builds distinct match-result, home, and away cards from live 1X2 prices", () => {
    const pool = [
      upcoming(1, "Arsenal", { leagueRank: 1, homeOdd: "1.45", awayOdd: "6.50" }),
      upcoming(2, "Liverpool", { leagueRank: 1, homeOdd: "1.50", awayOdd: "6.00" }),
      upcoming(3, "City", { leagueRank: 1, homeOdd: "1.60", awayOdd: "5.40" }),
      upcoming(4, "Chelsea", { leagueRank: 2, homeOdd: "1.70", awayOdd: "4.80" }),
      upcoming(5, "United", { leagueRank: 2, homeOdd: "1.80", awayOdd: "4.20" }),
      upcoming(6, "Villa", { leagueRank: 3, homeOdd: "1.90", awayOdd: "3.90" }),
      upcoming(7, "Brighton", { leagueRank: 8, homeOdd: "2.05", awayOdd: "3.40" }),
      upcoming(8, "Fulham", { leagueRank: 9, homeOdd: "2.10", awayOdd: "3.20" }),
      upcoming(9, "Brentford", {
        leagueRank: 10,
        homeOdd: "3.80",
        awayOdd: "1.85",
      }),
      upcoming(10, "Wolves", {
        leagueRank: 11,
        homeOdd: "3.60",
        awayOdd: "1.90",
      }),
      upcoming(11, "Everton", {
        leagueRank: 12,
        homeOdd: "3.40",
        awayOdd: "1.95",
      }),
      upcoming(12, "Palace", {
        leagueRank: 13,
        homeOdd: "3.20",
        awayOdd: "2.05",
      }),
      upcoming(13, "West Ham", {
        leagueRank: 14,
        homeOdd: "3.10",
        awayOdd: "2.10",
      }),
    ];
    const tickets = buildMultipleOfTheDayTickets(pool, {
      now: NOW,
      bonuses: [
        {
          type: "ACCUMULATOR",
          rules: { tiers: [{ minLegs: 5, bonusPercent: 10 }] },
        },
      ],
    });

    expect(tickets.map((t) => t.id)).toEqual([
      "mod-match-result",
      "mod-home-wins",
      "mod-away-wins",
    ]);
    expect(tickets[0].bonusPercent).toBe(10);
    expect(tickets[0].legs).toHaveLength(5);
    expect(tickets[0].legs.every((leg) => leg.label === "1")).toBe(true);
    expect(tickets[2].legs.every((leg) => leg.label === "2")).toBe(true);

    const fixtureIds = tickets.flatMap((t) => t.legs.map((leg) => leg.apiFixtureId));
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length);
  });

  it("maps a ticket onto slip selections the place-bet API can send", () => {
    const tickets = buildMultipleOfTheDayTickets(
      [upcoming(1, "Arsenal"), upcoming(2, "Liverpool"), upcoming(3, "City")],
      { now: NOW },
    );
    const selections = ticketToSlipSelections(tickets[0]);
    expect(selections[0]).toMatchObject({
      apiFixtureId: 1,
      matchName: "Arsenal V Away 1",
      marketCode: "MATCH_WINNER",
      marketParams: { side: "HOME" },
      label: "1",
      value: "1.55",
      fromLive: false,
    });
    expect(selections[0].id).toBe("Arsenal V Away 1-1");
  });
});
