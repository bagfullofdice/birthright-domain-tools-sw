/**
 * Birthright Domain Tools - Swords & Wizardry
 * v0.4.0
 *
 * This version intentionally follows the known-working ARS module pattern:
 * - ApplicationV2 form with action handlers
 * - Actor flags as storage
 * - Province taxLevel dropdown
 * - Collect Taxes rolls Birthright Table 17 and updates Treasury
 * - Collect Regency updates Current RP
 */

const MODULE_ID = "birthright-domain-tools-sw";

const DOMAIN_ACTIONS = [
  { name: "", type: "", cost: "", success: "", tip: "Select a domain action." },
  { name: "Adventure", type: "Character", cost: "None", success: "Special", tip: "The regent personally undertakes an adventure, quest, investigation, or field mission." },
  { name: "Agitate", type: "Domain / Realm", cost: "1 GB, 1 RP", success: "10+", tip: "Raise or lower province loyalty toward a ruler. Priests may often agitate once per domain turn as a free action." },
  { name: "Build", type: "Free unless personally supervised", cost: "Variable", success: "5+", tip: "Construct roads, bridges, halls, ports, palaces, warehouses, or other public works." },
  { name: "Contest", type: "Domain / Realm", cost: "1 RP", success: "10+", tip: "Disrupt a province or holding so it produces no income or regency until restored." },
  { name: "Create Holding", type: "Domain", cost: "1 GB", success: "10+", tip: "Create a level 0 law, guild, temple, or source holding where eligible." },
  { name: "Create Province", type: "Domain", cost: "Variable", success: "10+", tip: "Establish a new level 0 province in unsettled or unclaimed land." },
  { name: "Declare War", type: "Domain", cost: "None", success: "Special", tip: "Begin hostilities and allow movement of military units into foreign territory." },
  { name: "Decree", type: "Free", cost: "None", success: "Varies", tip: "Issue official commands, laws, appointments, bans, or proclamations." },
  { name: "Diplomacy", type: "Domain", cost: "1 GB", success: "Varies", tip: "Make alliances, treaties, concessions, trade agreements, or settlements." },
  { name: "Disband", type: "Free", cost: "None", success: "Automatic", tip: "Disband army units, holdings, or ships; may recover limited value when selling assets." },
  { name: "Espionage", type: "Domain / Realm", cost: "1 GB + possible RP", success: "Special", tip: "Investigate, spy, uncover troop movement, expose plots, sabotage, or attempt assassination." },
  { name: "Finances", type: "Free / Character", cost: "None or variable", success: "Special", tip: "Convert GB to personal wealth or personal wealth to GB; arrange loans or sell assets." },
  { name: "Forge Ley Line", type: "Domain", cost: "1 GB", success: "Special", tip: "A wizard creates a permanent magical connection between sources and provinces." },
  { name: "Fortify", type: "Domain / Realm", cost: "Variable", success: "2+", tip: "Create or improve castles and fortified holdings." },
  { name: "Grant", type: "Free", cost: "Variable", success: "Varies", tip: "Dispense titles, privileges, offices, gifts, or patronage." },
  { name: "Hold Action", type: "Free", cost: "None", success: "Automatic", tip: "Delay an action until later in the action round." },
  { name: "Investiture", type: "Domain / Realm", cost: "Variable", success: "Special", tip: "Transfer or confirm domain, regency, bloodline, vassalage, or inheritance through sacred rite." },
  { name: "Lieutenant", type: "Character", cost: "Variable", success: "Special", tip: "Recruit or create a lieutenant for the regent’s domain." },
  { name: "Move Troops", type: "Free", cost: "Usually 1 GB per 10 unit-province moves", success: "Automatic / special", tip: "Relocate troops within permitted territory or under declared war conditions." },
  { name: "Muster Armies", type: "Domain", cost: "Variable by unit", success: "Special", tip: "Create new army units." },
  { name: "Ply Trade", type: "Character", cost: "None", success: "Special", tip: "Use a personal profession or craft to earn money during the action round." },
  { name: "Realm Spell", type: "Domain", cost: "Spell cost", success: "Special", tip: "A priest or wizard regent casts realm magic through temple/source power and regency." },
  { name: "Research", type: "Character", cost: "1 GB+", success: "Special", tip: "Research spells, realm spells, magical items, or major arcane/theological work." },
  { name: "Rule", type: "Domain / Realm", cost: "1 GB plus RP by target level", success: "10+", tip: "Increase a province or holding by one level." },
  { name: "Trade Route", type: "Domain / Realm", cost: "1 GB, 1 RP", success: "10+", tip: "Create a profitable overland or basic sea trade route using guild influence." },
  { name: "Training", type: "Character", cost: "Special", success: "Special", tip: "Train for advancement, learn or improve proficiencies, or gain 1 hp." },
  { name: "Exploratory Trade", type: "Domain / Character", cost: "1 RP, 5 GB + cargo investment", success: "20+", tip: "Send ships on speculative long-distance voyages seeking new markets and profits." },
  { name: "Improve Unit", type: "Domain / Realm", cost: "1 RP, 1 GB per unit/month", success: "Special", tip: "Train a standard military unit to improve a battle rating or gain a new capability." },
  { name: "Ley Link", type: "Free", cost: "1 RP", success: "Automatic", tip: "Temporarily lend control of sources or ley lines to another wizard regent." },
  { name: "Move Ships", type: "Free", cost: "None", success: "Automatic", tip: "Order ships to sail, trade, transport, patrol, or support missions." },
  { name: "Move Troops by Sea", type: "Free", cost: "1 GB per five units", success: "Automatic", tip: "Use owned ships to transport military units by water." },
  { name: "Progress", type: "Realm", cost: "1 RP, 1 GB", success: "Special", tip: "Develop social, military, magical, technological, economic, or administrative advances." },
  { name: "Sea Trade Route", type: "Domain / Realm", cost: "1 RP, 1 GB", success: "10+", tip: "Expanded maritime trade route rules using ports, ships, cargo capacity, and sailing distance." },
  { name: "Trade Chain", type: "Domain", cost: "2 GB, 2 RP", success: "10+", tip: "Extend an existing trade route through linked ports or market nodes." }
];

const DEFAULT_ACTION_ENTRY = { action: "", target: "", cost: "", result: "", notes: "" };

const DEFAULT_DOMAIN_TURN = {
  label: "",
  season: "",
  year: "",
  freeActions: [
    { ...DEFAULT_ACTION_ENTRY },
    { ...DEFAULT_ACTION_ENTRY },
    { ...DEFAULT_ACTION_ENTRY }
  ],
  domainActions: [
    { ...DEFAULT_ACTION_ENTRY },
    { ...DEFAULT_ACTION_ENTRY },
    { ...DEFAULT_ACTION_ENTRY }
  ],
  notes: ""
};

function actionOptions(selected) {
  return DOMAIN_ACTIONS.map(action => ({
    value: action.name,
    label: action.name || "— Select Action —",
    title: action.name ? `${action.type}; Cost: ${action.cost}; Success: ${action.success}. ${action.tip}` : action.tip,
    selected: action.name === selected
  }));
}

function actionInfo(name) {
  return DOMAIN_ACTIONS.find(a => a.name === name) ?? DOMAIN_ACTIONS[0];
}


const DEFAULT_DOMAIN = {
  domainName: "",
  regent: "",
  capitalProvince: "",
  raceClassLevel: "",
  bloodlineStrength: "",
  bloodlineDerivation: "",
  bloodlineScore: 0,
  domainPower: 0,
  treasury: 0,
  currentRegency: 0,
  domainMaintenanceCost: 0,
  courtMaintenance: 0,
  diplomacyEffects: "",
  provinces: [],
  lieutenants: [],
  armies: [],
  tradeRoutes: [],
  domainTurns: []
};

const DEFAULT_PROVINCE = {
  name: "",
  terrain: "",
  level: 0,
  castle: 0,
  law: "None",
  temple: "None",
  guild: "None",
  source: "None",
  taxLevel: "Moderate",
  loyalty: "Average",
  regency: 0
};

const DEFAULT_ARMY = { unit: "", location: "", maintenance: 0 };
const DEFAULT_LIEUTENANT = { name: "", role: "" };
const DEFAULT_TRADE_ROUTE = { name: "", origin: "", destination: "", routeType: "Land", income: 0 };

// Birthright Table 17: Province Taxation.
// Null means no taxes are collected. Negative roll totals are treated as 0 GB.
const TAX_TABLE = {
  None: {
    0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null, 10: null
  },
  Light: {
    0: null,
    1: "1d3-2",
    2: "1d3-1",
    3: "1d3",
    4: "1d4",
    5: "1d4+1",
    6: "1d6+1",
    7: "1d8+1",
    8: "1d10+1",
    9: "1d12+1",
    10: "2d8"
  },
  Moderate: {
    0: null,
    1: "1d3-1",
    2: "1d3",
    3: "1d4",
    4: "1d4+1",
    5: "1d6+1",
    6: "1d8+1",
    7: "1d10+1",
    8: "1d12+1",
    9: "2d8",
    10: "2d8+2"
  },
  Severe: {
    0: "1d3-2",
    1: "1d3",
    2: "1d4",
    3: "1d4+1",
    4: "1d6+1",
    5: "1d8+1",
    6: "1d10+1",
    7: "1d12+1",
    8: "2d8",
    9: "2d8+2",
    10: "2d10+2"
  }
};

// Birthright Table 19: Domain Maintenance Costs.

// Birthright Table 18: Guild and Temple Collection.
// Province ratings above 7 use the 7+ row. Negative results are treated as 0 GB.
const GUILD_TEMPLE_COLLECTION_TABLE = {
  0: { 1: null,     2: null,     3: null,     "4-5": null,     "6+": null },
  1: { 1: "1d3-2", 2: null,     3: null,     "4-5": null,     "6+": null },
  2: { 1: "1d2-1", 2: "1d2",   3: null,     "4-5": null,     "6+": null },
  3: { 1: "1d2-1", 2: "1d3",   3: "1d4",   "4-5": null,     "6+": null },
  4: { 1: "1d2",   2: "1d3",   3: "1d4",   "4-5": "1d6",   "6+": null },
  5: { 1: "1d2",   2: "1d3",   3: "1d4",   "4-5": "1d6",   "6+": null },
  6: { 1: "1d2",   2: "1d3",   3: "2d2",   "4-5": "2d3",   "6+": "2d4+1" },
  7: { 1: "1d3",   2: "1d2+1", 3: "1d4+1", "4-5": "1d6+1", "6+": "2d4+2" }
};

function holdingLevelBand(level) {
  const rating = Math.floor(numberValue(level));
  if (rating <= 0) return null;
  if (rating <= 3) return rating;
  if (rating <= 5) return "4-5";
  return "6+";
}

function holdingCollectionFormula(provinceLevel, holdingLevel) {
  const provinceRating = Math.max(0, Math.min(7, Math.floor(numberValue(provinceLevel))));
  const band = holdingLevelBand(holdingLevel);
  if (!band) return null;
  return GUILD_TEMPLE_COLLECTION_TABLE?.[provinceRating]?.[band] ?? null;
}


const MAINTENANCE_TABLE = [
  { max: 2, cost: 0 },
  { max: 6, cost: 1 },
  { max: 12, cost: 2 },
  { max: 18, cost: 3 },
  { max: 24, cost: 4 },
  { max: 30, cost: 5 },
  { max: 40, cost: 7 },
  { max: 50, cost: 10 },
  { max: 75, cost: 20 },
  { max: 100, cost: 30 }
];

function duplicateData(data) {
  return foundry.utils.deepClone(data);
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHoldingLevel(value) {
  const cleaned = String(value ?? "None").trim();
  if (cleaned === "" || cleaned.toLowerCase() === "none") return "None";
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return "None";
  return Math.max(0, Math.min(10, Math.floor(parsed)));
}

function holdingExists(value) {
  return normalizeHoldingLevel(value) !== "None";
}

function holdingNumberValue(value) {
  const normalized = normalizeHoldingLevel(value);
  return normalized === "None" ? 0 : Number(normalized);
}

function holdingLevelOptions(selected) {
  const normalized = normalizeHoldingLevel(selected);
  const values = ["None", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return values.map(value => ({
    value: String(value),
    label: String(value),
    selected: String(value) === String(normalized)
  }));
}

function safeText(value) {
  return String(value ?? "").trim();
}

function clampProvinceLevel(level) {
  return Math.max(0, Math.min(10, Math.floor(numberValue(level))));
}

function normalizeTaxLevel(value) {
  const cleaned = safeText(value);
  if (["None", "Light", "Moderate", "Severe"].includes(cleaned)) return cleaned;
  if (["none", "light", "moderate", "severe"].includes(cleaned)) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return "Moderate";
}

function normalizeLoyalty(value) {
  const cleaned = safeText(value);
  return ["Rebellious", "Poor", "Average", "High", "Loyal"].includes(cleaned) ? cleaned : "Average";
}

function normalizeTradeRouteType(value) {
  const cleaned = safeText(value);
  return ["Land", "Sea"].includes(cleaned) ? cleaned : "Land";
}

function tradeRouteTypeOptions(selected) {
  return ["Land", "Sea"].map(value => ({
    value,
    label: value,
    selected: value === normalizeTradeRouteType(selected)
  }));
}

async function getDomain(actor) {
  if (!actor) return null;

  const stored = actor.getFlag(MODULE_ID, "domain") ?? {};
  const domain = foundry.utils.mergeObject(duplicateData(DEFAULT_DOMAIN), stored, {
    inplace: false,
    recursive: true
  });

  // Migration from earlier S&W versions: taxation -> taxLevel, lastTax removed.
  domain.provinces = (domain.provinces ?? []).map(p => {
    const migrated = {
      ...p,
      taxLevel: normalizeTaxLevel(p.taxLevel ?? p.taxation ?? "Moderate"),
      law: p.law === undefined ? "None" : normalizeHoldingLevel(p.law),
      temple: p.temple === undefined ? "None" : normalizeHoldingLevel(p.temple),
      guild: p.guild === undefined ? "None" : normalizeHoldingLevel(p.guild),
      source: p.source === undefined ? "None" : normalizeHoldingLevel(p.source)
    };
    delete migrated.taxation;
    return foundry.utils.mergeObject(duplicateData(DEFAULT_PROVINCE), migrated, {
      inplace: false,
      recursive: true
    });
  });

  if (!domain.regent) domain.regent = actor.name;

  return domain;
}

async function setDomain(actor, data) {
  if (!actor) {
    ui.notifications.warn("No actor provided.");
    return;
  }

  await actor.setFlag(MODULE_ID, "domain", data);
  return data;
}

function selectedOrUserActor() {
  const token = canvas.tokens.controlled[0] ?? null;
  return token?.actor ?? token?.document?.actor ?? game.user.character ?? null;
}

function normalizeDomainForm(formData) {
  const expanded = foundry.utils.expandObject(formData);
  const domain = foundry.utils.mergeObject(duplicateData(DEFAULT_DOMAIN), expanded.domain ?? {}, {
    inplace: false,
    recursive: true
  });

  domain.provinces = Object.values(expanded.provinces ?? {}).map(p => ({
    name: safeText(p.name),
    terrain: safeText(p.terrain),
    level: clampProvinceLevel(p.level),
    castle: numberValue(p.castle),
    law: normalizeHoldingLevel(p.law),
    temple: normalizeHoldingLevel(p.temple),
    guild: normalizeHoldingLevel(p.guild),
    source: normalizeHoldingLevel(p.source),
    taxLevel: normalizeTaxLevel(p.taxLevel),
    loyalty: normalizeLoyalty(p.loyalty),
    regency: numberValue(p.regency)
  }));

  domain.lieutenants = Object.values(expanded.lieutenants ?? {}).map(l => ({
    name: safeText(l.name),
    role: safeText(l.role)
  }));

  domain.armies = Object.values(expanded.armies ?? {}).map(a => ({
    unit: safeText(a.unit),
    location: safeText(a.location),
    maintenance: numberValue(a.maintenance)
  }));

  domain.tradeRoutes = Object.values(expanded.tradeRoutes ?? {}).map(t => ({
    name: safeText(t.name),
    origin: safeText(t.origin),
    destination: safeText(t.destination),
    routeType: normalizeTradeRouteType(t.routeType),
    income: numberValue(t.income)
  }));


  domain.domainTurns = Object.values(expanded.domainTurns ?? {}).map(t => ({
    label: safeText(t.label),
    season: safeText(t.season),
    year: safeText(t.year),
    freeActions: Object.values(t.freeActions ?? {}).map(a => ({
      action: safeText(a.action),
      target: safeText(a.target),
      cost: safeText(a.cost),
      result: safeText(a.result),
      notes: safeText(a.notes)
    })),
    domainActions: Object.values(t.domainActions ?? {}).map(a => ({
      action: safeText(a.action),
      target: safeText(a.target),
      cost: safeText(a.cost),
      result: safeText(a.result),
      notes: safeText(a.notes)
    })),
    notes: safeText(t.notes)
  }));

  domain.domainName = safeText(domain.domainName);
  domain.regent = safeText(domain.regent);
  domain.capitalProvince = safeText(domain.capitalProvince);
  domain.raceClassLevel = safeText(domain.raceClassLevel);
  domain.bloodlineStrength = safeText(domain.bloodlineStrength);
  domain.bloodlineDerivation = safeText(domain.bloodlineDerivation);
  domain.diplomacyEffects = safeText(domain.diplomacyEffects);
  domain.bloodlineScore = numberValue(domain.bloodlineScore);
  domain.domainPower = numberValue(domain.domainPower);
  domain.treasury = numberValue(domain.treasury);
  domain.currentRegency = numberValue(domain.currentRegency);
  domain.domainMaintenanceCost = numberValue(domain.domainMaintenanceCost);
  domain.courtMaintenance = numberValue(domain.courtMaintenance);

  return domain;
}

function taxOptions(selected) {
  return ["None", "Light", "Moderate", "Severe"].map(value => ({
    value,
    label: value,
    selected: value === selected
  }));
}

function loyaltyOptions(selected) {
  return ["Rebellious", "Poor", "Average", "High", "Loyal"].map(value => ({
    value,
    label: value,
    selected: value === selected
  }));
}

function provinceTaxFormula(level, taxLevel) {
  const rating = clampProvinceLevel(level);
  const normalized = normalizeTaxLevel(taxLevel);
  return TAX_TABLE?.[normalized]?.[rating] ?? null;
}

function calculateDomainMaintenance(domain) {
  const provinceCount = domain.provinces.length;
  const holdingCount = domain.provinces.reduce((sum, p) => {
    return sum
      + (holdingExists(p.law) ? 1 : 0)
      + (holdingExists(p.temple) ? 1 : 0)
      + (holdingExists(p.guild) ? 1 : 0)
      + (holdingExists(p.source) ? 1 : 0);
  }, 0);

  const total = provinceCount + holdingCount;

  for (const row of MAINTENANCE_TABLE) {
    if (total <= row.max) return { controlled: total, cost: row.cost };
  }

  return { controlled: total, cost: Math.ceil(total / 3) };
}


async function collectGuildTempleTradeForActor(actor, maybeDomain = null) {
  if (!actor) {
    ui.notifications.warn("Select a regent token first.");
    return null;
  }

  const domain = maybeDomain ?? await getDomain(actor);
  let guildIncome = 0;
  let templeIncome = 0;
  const landTradeIncome = domain.tradeRoutes
    .filter(t => normalizeTradeRouteType(t.routeType) === "Land")
    .reduce((sum, t) => sum + numberValue(t.income), 0);
  const seaTradeIncome = domain.tradeRoutes
    .filter(t => normalizeTradeRouteType(t.routeType) === "Sea")
    .reduce((sum, t) => sum + numberValue(t.income), 0);
  const tradeIncome = landTradeIncome + seaTradeIncome;
  let guildRows = "";
  let templeRows = "";
  const rolls = [];
  const registry = await buildWorldDomainRegistry();
  let lawClaimRows = "";

  for (const province of domain.provinces) {
    const provinceLevel = clampProvinceLevel(province.level);

    const guildLevel = holdingNumberValue(province.guild);
    if (guildLevel > 0) {
      const formula = holdingCollectionFormula(provinceLevel, guildLevel);
      let rollResult = "—";
      let income = 0;
      if (formula) {
        const roll = await new Roll(formula).evaluate();
        rolls.push(roll);
        income = Math.max(0, numberValue(roll.total));
        rollResult = `${formula} = ${roll.total}`;
      }
      guildIncome += income;
      guildRows += `<tr><td>${province.name || "Unnamed Province"}</td><td>${provinceLevel}</td><td>${guildLevel}</td><td>${rollResult}</td><td>${income} GB</td></tr>`;
      for (const claim of findLawClaimsForHolding(registry, province.name, actor.id)) {
        lawClaimRows += `<tr><td>${province.name || "Unnamed Province"}</td><td>Guild</td><td>${domain.domainName || actor.name}</td><td>${claim.domainName}</td><td>${holdingDisplay(claim.rawLevel)}</td></tr>`;
      }
    }

    const templeLevel = holdingNumberValue(province.temple);
    if (templeLevel > 0) {
      const formula = holdingCollectionFormula(provinceLevel, templeLevel);
      let rollResult = "—";
      let income = 0;
      if (formula) {
        const roll = await new Roll(formula).evaluate();
        rolls.push(roll);
        income = Math.max(0, numberValue(roll.total));
        rollResult = `${formula} = ${roll.total}`;
      }
      templeIncome += income;
      templeRows += `<tr><td>${province.name || "Unnamed Province"}</td><td>${provinceLevel}</td><td>${templeLevel}</td><td>${rollResult}</td><td>${income} GB</td></tr>`;
      for (const claim of findLawClaimsForHolding(registry, province.name, actor.id)) {
        lawClaimRows += `<tr><td>${province.name || "Unnamed Province"}</td><td>Temple</td><td>${domain.domainName || actor.name}</td><td>${claim.domainName}</td><td>${holdingDisplay(claim.rawLevel)}</td></tr>`;
      }
    }
  }

  const totalIncome = guildIncome + templeIncome + tradeIncome;
  domain.treasury = numberValue(domain.treasury) + totalIncome;
  await setDomain(actor, domain);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls,
    content: `
      <section class="birthright-chat-card">
        <h2>${domain.domainName || actor.name}: Guild, Temple, and Trade Collection</h2>
        <h3>Guild Collection</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead><tr><th style="text-align:left;">Province</th><th style="text-align:left;">Province Rating</th><th style="text-align:left;">Guild Level</th><th style="text-align:left;">Roll</th><th style="text-align:left;">Income</th></tr></thead>
          <tbody>${guildRows || `<tr><td colspan="5">No guild holdings to collect from.</td></tr>`}</tbody>
        </table>
        <h3>Temple Collection</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead><tr><th style="text-align:left;">Province</th><th style="text-align:left;">Province Rating</th><th style="text-align:left;">Temple Level</th><th style="text-align:left;">Roll</th><th style="text-align:left;">Income</th></tr></thead>
          <tbody>${templeRows || `<tr><td colspan="5">No temple holdings to collect from.</td></tr>`}</tbody>
        </table>
        <h3>Law Claim Warnings</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead><tr><th style="text-align:left;">Province</th><th style="text-align:left;">Target</th><th style="text-align:left;">Collector</th><th style="text-align:left;">Law Holder</th><th style="text-align:left;">Law Level</th></tr></thead>
          <tbody>${lawClaimRows || `<tr><td colspan="5">No outside law holdings detected against these collections.</td></tr>`}</tbody>
        </table>

        <hr>
        <p><b>Guild Income:</b> ${guildIncome} GB</p>
        <p><b>Temple Income:</b> ${templeIncome} GB</p>
        <p><b>Land Trade Route Income:</b> ${landTradeIncome} GB</p>
        <p><b>Sea Trade Route Income:</b> ${seaTradeIncome} GB</p>
        <p><b>Total Trade Route Income:</b> ${tradeIncome} GB</p>
        <p><b>Total Collected:</b> ${totalIncome} GB</p>
        <p><b>New Treasury:</b> ${domain.treasury} GB</p>
      </section>`
  });

  return { domain, guildIncome, templeIncome, tradeIncome, totalIncome };
}



function holdingDisplay(value) {
  const normalized = typeof normalizeHoldingLevel === "function" ? normalizeHoldingLevel(value) : value;
  return normalized === "None" ? "None" : String(normalized);
}

function hasDomainData(actor) {
  return !!actor?.getFlag?.(MODULE_ID, "domain");
}

async function buildWorldDomainRegistry() {
  const registry = {
    actors: [],
    provinces: {}
  };

  for (const actor of game.actors.filter(a => hasDomainData(a))) {
    const domain = await getDomain(actor);
    if (!domain) continue;

    const domainName = domain.domainName || actor.name;
    registry.actors.push({
      actorId: actor.id,
      actorName: actor.name,
      domainName,
      regent: domain.regent || actor.name,
      treasury: numberValue(domain.treasury),
      regency: numberValue(domain.currentRegency),
      domainPower: numberValue(domain.domainPower),
      bloodlineScore: numberValue(domain.bloodlineScore)
    });

    for (const province of domain.provinces ?? []) {
      const provinceName = safeText(province.name);
      if (!provinceName) continue;

      const key = provinceName.toLowerCase();
      if (!registry.provinces[key]) {
        registry.provinces[key] = {
          name: provinceName,
          provinceLevels: [],
          law: [],
          temple: [],
          guild: [],
          source: [],
          castles: []
        };
      }

      const entry = registry.provinces[key];
      const common = {
        actorId: actor.id,
        actorName: actor.name,
        domainName,
        regent: domain.regent || actor.name,
        province: provinceName
      };

      const provinceLevel = numberValue(province.level);
      if (provinceLevel > 0) entry.provinceLevels.push({ ...common, level: provinceLevel });

      const castleLevel = numberValue(province.castle);
      if (castleLevel > 0) entry.castles.push({ ...common, level: castleLevel });

      for (const type of ["law", "temple", "guild", "source"]) {
        const exists = typeof holdingExists === "function" ? holdingExists(province[type]) : numberValue(province[type]) > 0;
        if (exists) {
          entry[type].push({
            ...common,
            level: typeof holdingNumberValue === "function" ? holdingNumberValue(province[type]) : numberValue(province[type]),
            rawLevel: province[type]
          });
        }
      }
    }
  }

  return registry;
}

function findLawClaimsForHolding(registry, provinceName, holdingOwnerActorId) {
  const province = registry.provinces?.[safeText(provinceName).toLowerCase()];
  if (!province) return [];

  return (province.law ?? [])
    .filter(law => law.actorId !== holdingOwnerActorId)
    .map(law => ({
      ...law,
      note: `Law ${holdingDisplay(law.rawLevel)} held by ${law.domainName}`
    }));
}

function renderWorldDomainTrackerHTML(registry) {
  const actorRows = registry.actors
    .sort((a, b) => a.domainName.localeCompare(b.domainName))
    .map(d => `
      <tr>
        <td>${d.domainName}</td>
        <td>${d.regent}</td>
        <td>${d.treasury} GB</td>
        <td>${d.regency} RP</td>
        <td>${d.domainPower}</td>
        <td>${d.bloodlineScore}</td>
      </tr>
    `).join("");

  const provinceRows = Object.values(registry.provinces)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => {
      const province = p.provinceLevels.map(h => `${h.domainName} (${h.level})`).join("<br>") || "—";
      const law = p.law.map(h => `${h.domainName} (${holdingDisplay(h.rawLevel)})`).join("<br>") || "—";
      const temple = p.temple.map(h => `${h.domainName} (${holdingDisplay(h.rawLevel)})`).join("<br>") || "—";
      const guild = p.guild.map(h => `${h.domainName} (${holdingDisplay(h.rawLevel)})`).join("<br>") || "—";
      const source = p.source.map(h => `${h.domainName} (${holdingDisplay(h.rawLevel)})`).join("<br>") || "—";

      return `
        <tr>
          <td>${p.name}</td>
          <td>${province}</td>
          <td>${law}</td>
          <td>${temple}</td>
          <td>${guild}</td>
          <td>${source}</td>
        </tr>
      `;
    }).join("");

  return `
    <section class="birthright-chat-card">
      <h2>World Domain Tracker</h2>
      <p><b>Domains Found:</b> ${registry.actors.length}</p>

      <h3>Domains</h3>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left;">Domain</th>
            <th style="text-align:left;">Regent</th>
            <th style="text-align:left;">Treasury</th>
            <th style="text-align:left;">Regency</th>
            <th style="text-align:left;">Domain Power</th>
            <th style="text-align:left;">Bloodline</th>
          </tr>
        </thead>
        <tbody>${actorRows || `<tr><td colspan="6">No domain actors found.</td></tr>`}</tbody>
      </table>

      <h3>Province / Holding Index</h3>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left;">Province</th>
            <th style="text-align:left;">Province</th>
            <th style="text-align:left;">Law</th>
            <th style="text-align:left;">Temple</th>
            <th style="text-align:left;">Guild</th>
            <th style="text-align:left;">Source</th>
          </tr>
        </thead>
        <tbody>${provinceRows || `<tr><td colspan="6">No province records found.</td></tr>`}</tbody>
      </table>
    </section>
  `;
}

async function postWorldDomainTracker() {
  const registry = await buildWorldDomainRegistry();
  await ChatMessage.create({
    whisper: game.user.isGM ? ChatMessage.getWhisperRecipients("GM").map(u => u.id) : [],
    content: renderWorldDomainTrackerHTML(registry)
  });
  return registry;
}

class BirthrightSWDomainManager extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    id: "birthright-sw-domain-manager",
    tag: "form",
    classes: ["birthright-domain", "birthright-sw-domain", "sheet"],
    window: {
      title: "Birthright S&W Domain Manager",
      icon: "fas fa-crown",
      resizable: true
    },
    position: { width: 1080, height: 760 },
    form: {
      handler: BirthrightSWDomainManager.formHandler,
      submitOnChange: false,
      closeOnSubmit: false
    },
    actions: {
      addProvince: BirthrightSWDomainManager.addProvince,
      deleteProvince: BirthrightSWDomainManager.deleteProvince,
      addArmy: BirthrightSWDomainManager.addArmy,
      deleteArmy: BirthrightSWDomainManager.deleteArmy,
      addLieutenant: BirthrightSWDomainManager.addLieutenant,
      deleteLieutenant: BirthrightSWDomainManager.deleteLieutenant,
      addTradeRoute: BirthrightSWDomainManager.addTradeRoute,
      deleteTradeRoute: BirthrightSWDomainManager.deleteTradeRoute,
      collectTaxes: BirthrightSWDomainManager.collectTaxes,
      collectGuildTempleTrade: BirthrightSWDomainManager.collectGuildTempleTrade,
      collectRegency: BirthrightSWDomainManager.collectRegency,
      calculateMaintenance: BirthrightSWDomainManager.calculateMaintenance,
      payMaintenance: BirthrightSWDomainManager.payMaintenance,
      rollRandomEvent: BirthrightSWDomainManager.rollRandomEvent,
      postSummary: BirthrightSWDomainManager.postSummary,
      createJournal: BirthrightSWDomainManager.createJournal,
      worldDomainTracker: BirthrightSWDomainManager.worldDomainTracker,
      addDomainTurn: BirthrightSWDomainManager.addDomainTurn,
      deleteDomainTurn: BirthrightSWDomainManager.deleteDomainTurn,
      addFreeAction: BirthrightSWDomainManager.addFreeAction,
      deleteFreeAction: BirthrightSWDomainManager.deleteFreeAction
    }
  };

  static PARTS = {
    main: { template: `modules/${MODULE_ID}/templates/domain-manager.hbs` }
  };

  async _prepareContext(options) {
    const domain = await getDomain(this.actor);
    const maintenance = calculateDomainMaintenance(domain);
    const armyMaintenance = domain.armies.reduce((sum, a) => sum + numberValue(a.maintenance), 0);
    const courtMaintenance = numberValue(domain.courtMaintenance);
    const totalMaintenance = numberValue(maintenance.cost) + armyMaintenance + courtMaintenance;
    const regencyFromRows = domain.provinces.reduce((sum, p) => sum + numberValue(p.regency), 0);
    const baseRegency = regencyFromRows || numberValue(domain.domainPower);
    const bloodlineCap = numberValue(domain.bloodlineScore);
    const collectibleRegency = bloodlineCap > 0 ? Math.min(baseRegency, bloodlineCap) : baseRegency;

    return {
      actor: this.actor,
      domain,
      maintenance,
      armyMaintenance,
      courtMaintenance,
      totalMaintenance,
      regencyFromRows,
      collectibleRegency,
      systemId: game.system.id,
      isGM: game.user.isGM,
      provinceRows: domain.provinces.map((p, i) => {
        const law = normalizeHoldingLevel(p.law);
        const temple = normalizeHoldingLevel(p.temple);
        const guild = normalizeHoldingLevel(p.guild);
        const source = normalizeHoldingLevel(p.source);

        return {
          ...p,
          index: i,
          taxFormula: provinceTaxFormula(p.level, p.taxLevel) ?? "—",

          lawNone: law === "None", law0: law === 0, law1: law === 1, law2: law === 2, law3: law === 3, law4: law === 4, law5: law === 5, law6: law === 6, law7: law === 7, law8: law === 8, law9: law === 9, law10: law === 10,
          templeNone: temple === "None", temple0: temple === 0, temple1: temple === 1, temple2: temple === 2, temple3: temple === 3, temple4: temple === 4, temple5: temple === 5, temple6: temple === 6, temple7: temple === 7, temple8: temple === 8, temple9: temple === 9, temple10: temple === 10,
          guildNone: guild === "None", guild0: guild === 0, guild1: guild === 1, guild2: guild === 2, guild3: guild === 3, guild4: guild === 4, guild5: guild === 5, guild6: guild === 6, guild7: guild === 7, guild8: guild === 8, guild9: guild === 9, guild10: guild === 10,
          sourceNone: source === "None", source0: source === 0, source1: source === 1, source2: source === 2, source3: source === 3, source4: source === 4, source5: source === 5, source6: source === 6, source7: source === 7, source8: source === 8, source9: source === 9, source10: source === 10,

          taxOptions: taxOptions(normalizeTaxLevel(p.taxLevel)),
          loyaltyOptions: loyaltyOptions(p.loyalty ?? "Average")
        };
      }),
      armyRows: domain.armies.map((a, i) => ({ ...a, index: i })),
      lieutenantRows: domain.lieutenants.map((l, i) => ({ ...l, index: i })),
      tradeRouteRows: domain.tradeRoutes.map((t, i) => ({
        ...t,
        index: i,
        isLand: normalizeTradeRouteType(t.routeType) === "Land",
        isSea: normalizeTradeRouteType(t.routeType) === "Sea"
      })),
      domainTurnRows: (domain.domainTurns ?? []).map((turn, i) => ({
        ...turn,
        index: i,
        freeRows: (turn.freeActions ?? []).map((a, j) => ({
          ...a,
          turnIndex: i,
          actionIndex: j,
          round: j + 1,
          info: actionInfo(a.action),
          actionOptions: actionOptions(a.action)
        })),
        domainRows: (turn.domainActions ?? []).map((a, j) => ({
          ...a,
          turnIndex: i,
          actionIndex: j,
          round: j + 1,
          info: actionInfo(a.action),
          actionOptions: actionOptions(a.action)
        }))
      }))
    };
  }

  async _onRender(context, options) {
    await super._onRender?.(context, options);

    const domainName = context?.domain?.domainName || "Birthright S&W Domain Manager";
    const root = this.element?.querySelectorAll ? this.element : this.element?.[0];
    const win = root?.closest?.(".application, .window-app, .window");
    const titleNode = win?.querySelector?.(".window-title, .window-header .title");
    if (titleNode) titleNode.textContent = domainName;

    // Manual fallback action binding for Foundry builds where ApplicationV2 actions do not fire.
    root?.querySelectorAll?.("[data-action]")?.forEach(button => {
      if (button.dataset.brFallbackBound === "1") return;
      button.dataset.brFallbackBound = "1";

      button.addEventListener("click", async event => {
        // Let the native ApplicationV2 action handler run first if it exists.
        // The fallback fires shortly after only if nothing changed.
        const action = button.dataset.action;
        const fn = BirthrightSWDomainManager[action];
        if (typeof fn !== "function") return;

        window.setTimeout(async () => {
          if (button.dataset.brNativeHandled === "1") {
            button.dataset.brNativeHandled = "0";
            return;
          }

          try {
            await fn.call(this, event, button);
          } catch (err) {
            console.error(`Birthright S&W | Action failed: ${action}`, err);
            ui.notifications.error(`Birthright S&W action failed: ${action}. See console.`);
          }
        }, 50);
      });
    });
  }

  static async formHandler(event, form, formData) {
    const app = this;
    const domain = normalizeDomainForm(formData.object);
    await setDomain(app.actor, domain);
    ui.notifications.info(`${domain.domainName || app.actor.name} domain record saved.`);
    app.render({ force: true });
  }

  async saveCurrentForm() {
    const form = this.element;
    const fd = new FormDataExtended(form);
    const domain = normalizeDomainForm(fd.object);
    await setDomain(this.actor, domain);
    return domain;
  }

  static async addProvince(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    domain.provinces.push(duplicateData(DEFAULT_PROVINCE));
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteProvince(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const index = Number(target.dataset.index);
    const domain = await app.saveCurrentForm();
    domain.provinces.splice(index, 1);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async addArmy(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    domain.armies.push(duplicateData(DEFAULT_ARMY));
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteArmy(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const index = Number(target.dataset.index);
    const domain = await app.saveCurrentForm();
    domain.armies.splice(index, 1);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async addLieutenant(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    domain.lieutenants.push(duplicateData(DEFAULT_LIEUTENANT));
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteLieutenant(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const index = Number(target.dataset.index);
    const domain = await app.saveCurrentForm();
    domain.lieutenants.splice(index, 1);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async addTradeRoute(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    domain.tradeRoutes.push(duplicateData(DEFAULT_TRADE_ROUTE));
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteTradeRoute(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const index = Number(target.dataset.index);
    const domain = await app.saveCurrentForm();
    domain.tradeRoutes.splice(index, 1);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }



  static async worldDomainTracker(event, target) {
    if (target?.dataset) target.dataset.brNativeHandled = "1";
    await postWorldDomainTracker();
  }

  static async addDomainTurn(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const turn = duplicateData(DEFAULT_DOMAIN_TURN);
    turn.label = `Domain Turn ${domain.domainTurns.length + 1}`;
    domain.domainTurns.push(turn);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteDomainTurn(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const index = Number(target.dataset.index);
    const domain = await app.saveCurrentForm();
    domain.domainTurns.splice(index, 1);
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async addFreeAction(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const turnIndex = Number(target.dataset.turnIndex);
    const domain = await app.saveCurrentForm();

    if (!domain.domainTurns[turnIndex]) {
      ui.notifications.warn("Could not find that domain turn.");
      return;
    }

    domain.domainTurns[turnIndex].freeActions.push(duplicateData(DEFAULT_ACTION_ENTRY));
    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async deleteFreeAction(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const turnIndex = Number(target.dataset.turnIndex);
    const actionIndex = Number(target.dataset.actionIndex);
    const domain = await app.saveCurrentForm();

    if (!domain.domainTurns[turnIndex]) {
      ui.notifications.warn("Could not find that domain turn.");
      return;
    }

    domain.domainTurns[turnIndex].freeActions.splice(actionIndex, 1);

    if (domain.domainTurns[turnIndex].freeActions.length === 0) {
      domain.domainTurns[turnIndex].freeActions.push(duplicateData(DEFAULT_ACTION_ENTRY));
    }

    await setDomain(app.actor, domain);
    app.render({ force: true });
  }

  static async collectTaxes(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    let totalProvinceIncome = 0;
    let chatRows = "";

    for (const province of domain.provinces) {
      const level = clampProvinceLevel(province.level);
      const taxLevel = normalizeTaxLevel(province.taxLevel);
      const lawLevel = typeof holdingNumberValue === "function" ? holdingNumberValue(province.law) : numberValue(province.law);
      const formula = TAX_TABLE?.[taxLevel]?.[level];
      let rollResult = "—";
      let income = 0;

      if (lawLevel <= 0) {
        rollResult = `No tax collection: Law ${province.law ?? "None"}`;
      } else if (formula) {
        const roll = await new Roll(formula).evaluate();
        income = Math.max(0, numberValue(roll.total));
        rollResult = `${formula} = ${roll.total}`;
      }

      totalProvinceIncome += income;
      chatRows += `
        <tr>
          <td>${province.name || "Unnamed Province"}</td>
          <td>${taxLevel}</td>
          <td>${level}</td>
          <td>${lawLevel > 0 ? lawLevel : (province.law ?? "None")}</td>
          <td>${rollResult}</td>
          <td>${income} GB</td>
        </tr>
      `;
    }

    const tradeIncome = domain.tradeRoutes.reduce((sum, t) => sum + numberValue(t.income), 0);
    const totalIncome = totalProvinceIncome + tradeIncome;
    domain.treasury = numberValue(domain.treasury) + totalIncome;

    await setDomain(app.actor, domain);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `
        <section class="birthright-chat-card">
          <h2>${domain.domainName || app.actor.name}: Tax Collection</h2>
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align:left;">Province</th>
                <th style="text-align:left;">Taxation</th>
                <th style="text-align:left;">Level</th>
                <th style="text-align:left;">Law</th>
                <th style="text-align:left;">Roll</th>
                <th style="text-align:left;">Income</th>
              </tr>
            </thead>
            <tbody>${chatRows}</tbody>
          </table>
          <hr>
          <p><b>Province Income:</b> ${totalProvinceIncome} GB</p>
          <p><b>Trade Route Income:</b> ${tradeIncome} GB</p>
          <p><b>Total Collected:</b> ${totalIncome} GB</p>
          <p><b>New Treasury:</b> ${domain.treasury} GB</p>
        </section>
      `
    });

    app.render({ force: true });
  }



  static async collectGuildTempleTrade(event, target) {
    if (target?.dataset) target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    await collectGuildTempleTradeForActor(app.actor, domain);
    app.render({ force: true });
  }

  static async collectRegency(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();

    const rowRegency = domain.provinces.reduce((sum, p) => sum + numberValue(p.regency), 0);
    const baseRegency = rowRegency || numberValue(domain.domainPower);
    const bloodlineCap = numberValue(domain.bloodlineScore);
    const totalRegency = bloodlineCap > 0 ? Math.min(baseRegency, bloodlineCap) : baseRegency;

    domain.currentRegency = numberValue(domain.currentRegency) + totalRegency;

    await setDomain(app.actor, domain);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `
        <h2>${domain.domainName || app.actor.name}: Regency Collection</h2>
        <p><b>Domain Power / Row RP:</b> ${baseRegency} RP</p>
        <p><b>Bloodline Score Cap:</b> ${bloodlineCap || "None entered"}</p>
        <p><b>Regency Collected:</b> ${totalRegency} RP</p>
        <p><b>New Regency Total:</b> ${domain.currentRegency} RP</p>
      `
    });

    app.render({ force: true });
  }

  static async calculateMaintenance(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const maintenance = calculateDomainMaintenance(domain);
    const armyMaintenance = domain.armies.reduce((sum, a) => sum + numberValue(a.maintenance), 0);
    const courtMaintenance = numberValue(domain.courtMaintenance);
    const totalMaintenance = numberValue(maintenance.cost) + armyMaintenance + courtMaintenance;

    // Keep this field as the domain maintenance cost only, so Pay Maintenance does not double-count armies.
    domain.domainMaintenanceCost = maintenance.cost;

    await setDomain(app.actor, domain);

    ui.notifications.info(`Maintenance calculated: ${maintenance.cost} GB domain + ${armyMaintenance} GB army + ${courtMaintenance} GB court = ${totalMaintenance} GB total.`);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `
        <h2>${domain.domainName || app.actor.name}: Maintenance Calculation</h2>
        <p><b>Controlled Provinces/Holdings:</b> ${maintenance.controlled}</p>
        <p><b>Domain Maintenance:</b> ${maintenance.cost} GB</p>
        <p><b>Army Maintenance:</b> ${armyMaintenance} GB</p>
        <p><b>Court Maintenance:</b> ${courtMaintenance} GB</p>
        <hr>
        <p><b>Total Maintenance Due:</b> ${totalMaintenance} GB</p>
      `
    });

    app.render({ force: true });
  }

  static async payMaintenance(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const armyMaintenance = domain.armies.reduce((sum, a) => sum + numberValue(a.maintenance), 0);
    const totalMaintenance = numberValue(domain.domainMaintenanceCost) + numberValue(domain.courtMaintenance) + armyMaintenance;
    domain.treasury = numberValue(domain.treasury) - totalMaintenance;

    await setDomain(app.actor, domain);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `<h2>${domain.domainName || app.actor.name}: Maintenance Paid</h2><p><b>Domain Maintenance:</b> ${domain.domainMaintenanceCost} GB</p><p><b>Court Maintenance:</b> ${domain.courtMaintenance} GB</p><p><b>Army Maintenance:</b> ${armyMaintenance} GB</p><p><b>Total Maintenance:</b> ${totalMaintenance} GB</p><p><b>New Treasury:</b> ${domain.treasury} GB</p>`
    });

    app.render({ force: true });
  }

  static async rollRandomEvent(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const roll = await new Roll("2d10").evaluate();
    const total = roll.total;
    let eventName = "No Event";

    if (total === 2) eventName = "Blood Challenge";
    else if (total === 3) eventName = "Assassination";
    else if (total === 4) eventName = "Festival";
    else if (total === 5) eventName = "Feud";
    else if (total === 6) eventName = "Natural Event";
    else if (total === 7) eventName = "Diplomatic Matter";
    else if (total === 8) eventName = "Corruption/Crime";
    else if (total >= 9 && total <= 12) eventName = "No Event";
    else if (total >= 13 && total <= 14) eventName = "Monsters or Brigandage";
    else if (total === 15) eventName = "Trade Matter";
    else if (total === 16) eventName = "Intrigue";
    else if (total === 17) eventName = "Unrest or Rebellion";
    else if (total === 18) eventName = "Matter of Justice";
    else if (total === 19) eventName = "Great Captain/Heresy";
    else if (total === 20) eventName = "Magical Event";

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `<h2>${domain.domainName || app.actor.name}: Random Domain Event</h2><p><b>Roll:</b> ${total}</p><p><b>Event:</b> ${eventName}</p>`,
      rolls: [roll]
    });
  }

  static async postSummary(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const maintenance = calculateDomainMaintenance(domain);
    const rowRegency = domain.provinces.reduce((sum, p) => sum + numberValue(p.regency), 0);
    const baseRegency = rowRegency || numberValue(domain.domainPower);
    const bloodlineCap = numberValue(domain.bloodlineScore);
    const collectible = bloodlineCap > 0 ? Math.min(baseRegency, bloodlineCap) : baseRegency;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: app.actor }),
      content: `<h2>${domain.domainName || app.actor.name}: Domain Summary</h2><p><b>Regent:</b> ${domain.regent || "—"}</p><p><b>Capital Province:</b> ${domain.capitalProvince || "—"}</p><p><b>Treasury:</b> ${domain.treasury} GB</p><p><b>Regency:</b> ${domain.currentRegency} RP</p><p><b>Collectible RP:</b> ${collectible} RP</p><p><b>Calculated Domain Maintenance:</b> ${maintenance.cost} GB (${maintenance.controlled} provinces/holdings)</p><p><b>Army Maintenance:</b> ${domain.armies.reduce((sum, a) => sum + numberValue(a.maintenance), 0)} GB</p><p><b>Total Maintenance Before Court:</b> ${maintenance.cost + domain.armies.reduce((sum, a) => sum + numberValue(a.maintenance), 0)} GB</p><p><b>Provinces:</b> ${domain.provinces.length}</p><p><b>Armies:</b> ${domain.armies.length}</p><p><b>Trade Routes:</b> ${domain.tradeRoutes.length}</p>`
    });
  }

  static async createJournal(event, target) {
    target.dataset.brNativeHandled = "1";
    const app = this;
    const domain = await app.saveCurrentForm();
    const name = `${domain.domainName || app.actor.name} Domain Ledger`;
    const maintenance = calculateDomainMaintenance(domain);

    const tradeRouteRows = domain.tradeRoutes.map(t => `
      <tr><td>${t.name}</td><td>${t.routeType || "Land"}</td><td>${t.origin}</td><td>${t.destination}</td><td>${t.income}</td></tr>
    `).join("");

    const rows = domain.provinces.map(p => `
      <tr>
        <td>${p.name}</td><td>${p.terrain}</td><td>${p.level}</td><td>${p.castle}</td>
        <td>${p.law}</td><td>${p.temple}</td><td>${p.guild}</td><td>${p.source}</td>
        <td>${p.taxLevel}</td><td>${p.loyalty}</td><td>${p.regency}</td>
      </tr>
    `).join("");


    const turnRows = (domain.domainTurns ?? []).map(turn => {
      const free = (turn.freeActions ?? []).filter(a => a.action || a.notes || a.target).map(a => `<li><b>${a.action || "Free Action"}:</b> ${a.target || ""} ${a.result ? `(${a.result})` : ""}<br>${a.notes || ""}</li>`).join("");
      const domainActs = (turn.domainActions ?? []).filter(a => a.action || a.notes || a.target).map((a, i) => `<li><b>Action ${i + 1} - ${a.action || "Domain Action"}:</b> ${a.target || ""} ${a.result ? `(${a.result})` : ""}<br>${a.notes || ""}</li>`).join("");
      return `<h3>${turn.label || "Domain Turn"} ${turn.season || ""} ${turn.year || ""}</h3><p>${turn.notes || ""}</p><h4>Free Actions</h4><ul>${free || "<li>None recorded.</li>"}</ul><h4>Domain Actions</h4><ul>${domainActs || "<li>None recorded.</li>"}</ul>`;
    }).join("");

    const content = `
      <h1>${name}</h1>
      <p><b>Regent:</b> ${domain.regent || app.actor.name}</p>
      <p><b>Class/Level:</b> ${domain.raceClassLevel || "—"}</p>
      <p><b>Bloodline:</b> ${domain.bloodlineDerivation || "—"} ${domain.bloodlineStrength || ""} (${domain.bloodlineScore || 0})</p>
      <p><b>Treasury:</b> ${domain.treasury} GB</p>
      <p><b>Regency:</b> ${domain.currentRegency} RP</p>
      <p><b>Domain Maintenance:</b> ${domain.domainMaintenanceCost} GB; calculated ${maintenance.cost} GB</p>
      <h2>Provinces and Holdings</h2>
      <table>
        <thead>
          <tr><th>Province</th><th>Terr.</th><th>Level</th><th>Castle</th><th>Law</th><th>Temple</th><th>Guild</th><th>Source</th><th>Tax</th><th>Loyalty</th><th>RP</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <h2>Trade Routes</h2>
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Origin</th><th>Destination</th><th>Income</th></tr></thead>
        <tbody>${tradeRouteRows || "<tr><td colspan='5'>No trade routes recorded.</td></tr>"}</tbody>
      </table>
      <h2>Domain Turns and Actions</h2>
      ${turnRows || "<p>No domain turns recorded.</p>"}
    `;

    let journal = game.journal.getName(name);
    if (!journal) journal = await JournalEntry.create({ name });

    const page = journal.pages.find(p => p.name === "Ledger");
    if (page) await page.update({ text: { content } });
    else await journal.createEmbeddedDocuments("JournalEntryPage", [{
      name: "Ledger",
      type: "text",
      text: { content, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML }
    }]);

    ui.notifications.info(`${name} created/updated.`);
  }
}

function openDomainManager(actor = null) {
  actor = actor ?? selectedOrUserActor();

  if (!actor) {
    ui.notifications.warn("Select a token or assign a character before opening the Domain Manager.");
    return;
  }

  if (!actor.isOwner && !game.user.isGM) {
    ui.notifications.error(`You do not have Owner permission for ${actor.name}.`);
    return;
  }

  new BirthrightSWDomainManager(actor).render(true);
}

Hooks.once("init", () => console.log("Birthright Domain Tools S&W | Initializing"));

Hooks.once("ready", () => {
  console.log("Birthright Domain Tools S&W | Ready");

  game.birthrightSW = game.birthrightSW || {};
  game.birthrightSW.MODULE_ID = MODULE_ID;
  game.birthrightSW.TAX_TABLE = TAX_TABLE;
  game.birthrightSW.openDomainManager = openDomainManager;
  game.birthrightSW.getDomain = getDomain;
  game.birthrightSW.setDomain = setDomain;
  game.birthrightSW.selectedActor = selectedOrUserActor;
  game.birthrightSW.provinceTaxFormula = provinceTaxFormula;
  game.birthrightSW.holdingCollectionFormula = holdingCollectionFormula;
  game.birthrightSW.GUILD_TEMPLE_COLLECTION_TABLE = GUILD_TEMPLE_COLLECTION_TABLE;
  game.birthrightSW.calculateMaintenance = calculateDomainMaintenance;
  game.birthrightSW.holdingCollectionFormula = holdingCollectionFormula;
  game.birthrightSW.GUILD_TEMPLE_COLLECTION_TABLE = GUILD_TEMPLE_COLLECTION_TABLE;
  game.birthrightSW.collectGuildTempleTrade = async (actor = selectedOrUserActor()) => {
    if (!actor) return ui.notifications.warn('Select a regent token first.');
    const app = new BirthrightSWDomainManager(actor);
    await app.render(true);
    const domain = await getDomain(actor);
    const fakeTarget = { dataset: { brNativeHandled: '0' } };
    return BirthrightSWDomainManager.collectGuildTempleTrade.call(app, new Event('click'), fakeTarget);
  };
  game.birthrightSW.DOMAIN_ACTIONS = DOMAIN_ACTIONS;


  game.birthrightSW.holdingCollectionFormula = holdingCollectionFormula;
  game.birthrightSW.GUILD_TEMPLE_COLLECTION_TABLE = GUILD_TEMPLE_COLLECTION_TABLE;
  game.birthrightSW.collectGuildTempleTrade = async function(actor = selectedOrUserActor()) {
    return collectGuildTempleTradeForActor(actor);
  };


  game.birthrightSW.buildWorldDomainRegistry = buildWorldDomainRegistry;
  game.birthrightSW.postWorldDomainTracker = postWorldDomainTracker;
  game.birthrightSW.findLawClaimsForHolding = findLawClaimsForHolding;

  ui.notifications.info("Birthright Domain Tools - S&W loaded.");
});
