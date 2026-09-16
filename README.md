# Birthright Domain Tools - Swords & Wizardry v0.5.3

This version ports the known-working ARS calculation pattern into the standalone Swords & Wizardry module.

## Install

Replace the folder:

`FoundryVTT/Data/modules/birthright-domain-tools-sw`

with this module folder.

Restart Foundry.

## Macro

```js
game.birthrightSW.openDomainManager();
```

## Key behavior

- Domain data is stored on the selected Actor under:
  `birthright-domain-tools-sw.domain`
- Province taxation uses Birthright Table 17.
- Tax levels: None, Light, Moderate, Severe.
- Collect Taxes rolls taxation and updates Treasury.
- Collect Regency uses the province row Regency total, or Domain Power if row total is 0, capped by Bloodline Score if entered.
- Calculate Maintenance uses Birthright Table 19 style bands.
- Random Event uses 2d10.


## v0.5.3

Adds a Domain Turns and Actions tracker.

- Add multiple domain turns.
- Each domain turn has:
  - Turn label
  - Season/months
  - Year
  - Free actions section
  - Three domain actions/action rounds
  - Notes/details
- Action dropdown includes core and supplemental Birthright actions with tooltips.
- Journal export now includes domain turn/action history.


## v0.5.3

- Calculate Maintenance now includes:
  - Domain maintenance
  - Army maintenance
  - Court maintenance
- The Domain Maintenance Cost field still stores domain-only maintenance so Pay Maintenance does not double-count army upkeep.
- The maintenance calculation posts a chat summary.


## v0.5.4

- Free actions are now expandable per domain turn.
- Added Add Free Action button.
- Added delete button for individual free action rows.
- Each domain turn still starts with three free action rows by default.


## v0.5.5

- Split province taxation from guild/temple/trade collection.
- Added Collect Guild/Temple/Trade button.
- Guild income and Temple income are rolled separately using Birthright Table 18.
- Trade route income is added after guild and temple income.
- Chat output lists Guild Income, Temple Income, Trade Route Income, and Total Collected.


## v0.5.6

- Fixes button binding for Collect Guild/Temple/Trade.
- Adds console test helper:
  ```js
  game.birthrightSW.collectGuildTempleTrade()
  ```
- Manual action binding now directly invokes button actions instead of waiting for native ApplicationV2 handling.


## v0.5.7

- Hard-fixes the Guild/Temple/Trade collection helper export.
- Adds/repairs:
  ```js
  game.birthrightSW.collectGuildTempleTrade()
  ```
- Confirms Table 18 helpers are loaded into `game.birthrightSW`.


## v0.5.8

- Rebuilds Guild/Temple/Trade collection as a standalone actor-based function.
- The button saves the sheet, then processes saved actor flag data.
- Console helper:
  ```js
  game.birthrightSW.collectGuildTempleTrade()
  ```


## v0.5.9

- Trade routes now have a Type field: Land or Sea.
- Collect Guild/Temple/Trade separates Land Trade and Sea Trade income in chat output.
- Journal export now includes a Trade Routes table with route type.


## v0.6.0

- Improved responsive widths for Lieutenants, Armies, and Trade Routes.
- Army maintenance field is now compact.
- Trade route Type and GB fields are compact.
- Three lower panels wrap more cleanly on smaller sheet widths.
- Province/holding numeric fields are more compact.


## v0.6.1

- Replaces the lower Lieutenant, Army, and Trade Route row layout with compact mini-table rows.
- Army maintenance and trade income are now intentionally small fields.
- Lower panels wrap at medium widths and stack at narrow widths.
- Trade route fields no longer clip as aggressively in narrower windows.


## v0.6.2

- Fixes the Land/Sea trade route dropdown by replacing generated option arrays with explicit Land and Sea options.
- Adds simple selected-state booleans for trade route type.


## v0.6.3

- Holdings now distinguish `None` from `0`.
- Default Law, Temple, Guild, and Source holdings are now `None`.
- `None` means no holding exists.
- `0` means a level 0 holding exists.
- Level 0 holdings do not generate guild/temple income but do count as controlled holdings for maintenance.
- Guild and Temple collection only rolls for holding levels 1+.


## v0.6.4

- Fixes Law, Temple, Guild, and Source holding dropdowns.
- Replaces generated holding option arrays with explicit option markup for Foundry/Handlebars compatibility.


## v0.7.0

Adds a World Domain Tracker.

- Scans all actors that have `birthright-domain-tools-sw.domain` flag data.
- Builds a province-by-province holding index.
- Posts a GM-whispered World Domain Tracker report to chat.
- Adds a World Tracker button to the sheet header.
- Exposes console helpers:
  ```js
  game.birthrightSW.buildWorldDomainRegistry()
  game.birthrightSW.postWorldDomainTracker()
  ```
- Guild/Temple/Trade collection now includes Law Claim Warnings when another domain has law holdings in the same province.


## v0.7.1

- Province tax collection now requires Law 1+ in that province.
- Law `None` and Law `0` do not roll province taxes and produce 0 GB.
- Tax chat output now includes a Law column and explains skipped tax rolls.
