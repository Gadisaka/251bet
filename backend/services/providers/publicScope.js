/**
 * Dual-provider isolation. OddsPapi shadow rows live in the same collections
 * as API-Football with `provider: "oddspapi"`. Production queries MUST exclude
 * them so customers never see, place, or settle those fixtures.
 *
 * Legacy API-Football documents have no `provider` field. Mongo `$ne` matches
 * missing fields, so `{ provider: { not: "oddspapi" } }` keeps them.
 */

export const PROVIDER_APIFOOTBALL = "apifootball";
export const PROVIDER_ODDSPAPI = "oddspapi";

export function notOddspapiWhere() {
  return { provider: { not: PROVIDER_ODDSPAPI } };
}

export function andNotOddspapi(where = {}) {
  return { AND: [where, notOddspapiWhere()] };
}

export function isOddspapiRow(row) {
  return row?.provider === PROVIDER_ODDSPAPI;
}
