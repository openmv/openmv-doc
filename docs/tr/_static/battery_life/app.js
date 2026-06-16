// OpenMV Battery Life Estimator -- standalone JS module.

"use strict";

// ===========================================================================
//   HOW TO ENTER MEASURED POWER NUMBERS
// ===========================================================================
//
//   Every `IF.X(active_mW, sleep_mW)` call inside the BOARDS table below
//   carries two numbers: the system's average **power**, in milliwatts,
//   while the firmware is running and while it is in deepsleep. Measure
//   the power at the corresponding power-input pin (V x I).
//
//   Example -- if you measured 480 mW running and 0.8 mW asleep on the
//   N6's LiPo input, write:
//
//       lipo: IF.LIPO(480, 0.8),
//
//   Both values default to 0 (means "not measured yet"). Edit the BOARDS
//   table below only; the IF helpers and the math below do not need to
//   change.
//
// ===========================================================================

// Each helper returns an interface descriptor.
//   active_mW / sleep_mW -- measured power (mW) when running / deepsleep.
//   v_supply             -- nominal supply voltage at this input (V).
//   v_supply_min/max     -- accepted input range for ranged interfaces.
//   allowBattery         -- if false, battery runtime is N/A (USB host).
//   allowedBatteryGroups -- which BATTERY_GROUPS show in the Type selector
//                           for this interface.
//   hint                 -- short string shown under the interface dropdown.
const IF = {
  USB:    (active_mW = 0, sleep_mW = 0) => ({
    name: "USB (5V)",
    active_mW, sleep_mW,
    v_supply: 5.0,
    allowBattery: true,
    allowedBatteryGroups: ["custom"],
    hint: "5V via USB power bank.",
  }),
  VIN_5V: (active_mW = 0, sleep_mW = 0) => ({
    name: "VIN (5V)",
    active_mW, sleep_mW,
    v_supply: 5.0,
    allowBattery: true,
    allowedBatteryGroups: ["custom"],
    hint: "5V supply wired to the VIN / GND pads.",
  }),
  VIN_HV: (active_mW = 0, sleep_mW = 0) => ({
    name: "VIN high voltage (6-36V)",
    active_mW, sleep_mW,
    v_supply: 12.0, v_supply_min: 6.0, v_supply_max: 36.0,
    allowBattery: true,
    allowedBatteryGroups: ["custom"],
    hint: "6-36V supply via the the battery shield's VIN high-voltage input.",
  }),
  LOW_V:  (active_mW = 0, sleep_mW = 0) => ({
    name: "RAW low voltage (1.8-5.5V)",
    active_mW, sleep_mW,
    v_supply: 3.0, v_supply_min: 1.8, v_supply_max: 5.5,
    allowBattery: true,
    allowedBatteryGroups: ["alkaline", "lithium", "custom"],
    hint: "1.8-5.5V supply via the battery shield's RAW low-voltage input.",
  }),
  LIPO:   (active_mW = 0, sleep_mW = 0) => ({
    name: "LiPo (3.7V)",
    active_mW, sleep_mW,
    v_supply: 3.7,
    allowBattery: true,
    allowedBatteryGroups: ["lipo_ada", "lipo_sf", "custom"],
    hint: "1S LiPo via the JST connector.",
  }),
  QWIIC:  (active_mW = 0, sleep_mW = 0) => ({
    name: "QWIIC (3.3V)",
    active_mW, sleep_mW,
    v_supply: 3.3,
    allowBattery: true,
    allowedBatteryGroups: ["custom"],
    hint: "3.3V supply via the QWIIC connector.",
  }),
};

// =========================================================================
// BOARDS table -- EDIT THE IF.X(active_mW, sleep_mW) CALLS BELOW.
//
// Each (board, shield, interface) line gets its own numbers; nothing is
// shared between boards even when the form-factor matches, because power
// can differ between cams with the same shield.
//
// Interfaces are listed battery-input-first, USB last, so the dropdown
// defaults to the most likely battery input for each (board, shield).
// =========================================================================
const BOARDS = {
  // ---- OpenMV cameras (docs order) ----

  n6: {
    name: "OpenMV Cam N6",
    shields: {
      none: { name: "(no shield)", interfaces: {
        lipo: IF.LIPO(750, 3.7),
        vin:  IF.VIN_5V(750, 12.5),
        usb:  IF.USB(750, 12.5),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        lipo:   IF.LIPO(750, 3.7),
        low_v:  IF.LOW_V(750, 3.789),
        vin_hv: IF.VIN_HV(750, 12.5),
        usb:    IF.USB(750, 12.5),
      } },
    },
  },

  ae3: {
    name: "OpenMV Cam AE3",
    shields: {
      none: { name: "(no shield)", interfaces: {
        qwiic: IF.QWIIC(200, 0.264),
        usb:   IF.USB(200, 12.5),
      } },
      ae3_battery_shield: { name: "AE3 Battery Shield", interfaces: {
        lipo:   IF.LIPO(200, 0.5),
        low_v:  IF.LOW_V(200, 0.475),
        vin_hv: IF.VIN_HV(200, 12.5),
        qwiic:  IF.QWIIC(200, 12.5),
        usb:    IF.USB(200, 12.5),
      } },
    },
  },

  rt1062: {
    name: "OpenMV Cam RT1062",
    shields: {
      none: { name: "(no shield)", interfaces: {
        lipo: IF.LIPO(750, 0.111),
        vin:  IF.VIN_5V(750, 12.5),
        usb:  IF.USB(750, 12.5),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        lipo:   IF.LIPO(750, 0.111),
        low_v:  IF.LOW_V(750, 0.2),
        vin_hv: IF.VIN_HV(750, 12.5),
        usb:    IF.USB(750, 12.5),
      } },
    },
  },

  h7_plus: {
    name: "OpenMV Cam H7 Plus",
    shields: {
      none: { name: "(no shield)", interfaces: {
        lipo: IF.LIPO(750, 3.7),
        vin:  IF.VIN_5V(750, 3.7),
        usb:  IF.USB(750, 3.7),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        lipo:   IF.LIPO(750, 3.7),
        low_v:  IF.LOW_V(750, 3.789),
        vin_hv: IF.VIN_HV(750, 5),
        usb:    IF.USB(750, 3.7),
      } },
    },
  },

  h7: {
    name: "OpenMV Cam H7",
    shields: {
      none: { name: "(no shield)", interfaces: {
        lipo: IF.LIPO(750, 3.7),
        vin:  IF.VIN_5V(750, 3.7),
        usb:  IF.USB(750, 3.7),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        lipo:   IF.LIPO(750, 3.7),
        low_v:  IF.LOW_V(750, 3.789),
        vin_hv: IF.VIN_HV(750, 5),
        usb:    IF.USB(750, 3.7),
      } },
    },
  },

  m7: {
    name: "OpenMV Cam M7 (Legacy)",
    shields: {
      none: { name: "(no shield)", interfaces: {
        vin: IF.VIN_5V(750, 3.7),
        usb: IF.USB(750, 3.7),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        low_v:  IF.LOW_V(750, 3.789),
        vin_hv: IF.VIN_HV(750, 5),
        usb:    IF.USB(750, 3.7),
      } },
    },
  },

  m4: {
    name: "OpenMV Cam M4 (Legacy)",
    shields: {
      none: { name: "(no shield)", interfaces: {
        vin: IF.VIN_5V(750, 3.7),
        usb: IF.USB(750, 3.7),
      } },
      battery_shield: { name: "Battery Shield", interfaces: {
        low_v:  IF.LOW_V(750, 3.789),
        vin_hv: IF.VIN_HV(750, 5),
        usb:    IF.USB(750, 3.7),
      } },
    },
  },

  // ---- Arduino boards (docs order) ----
  // VIN exists on these boards but isn't documented as a battery input
  // here; USB only.

  nicla: {
    name: "Arduino Nicla Vision",
    shields: { none: { name: "(no shield)", interfaces: {
      usb: IF.USB(750, 0.500),
    } } },
  },

  portenta: {
    name: "Arduino Portenta H7",
    shields: { none: { name: "(no shield)", interfaces: {
      usb: IF.USB(750, 0.500),
    } } },
  },

  giga: {
    name: "Arduino Giga R1 WiFi",
    shields: { none: { name: "(no shield)", interfaces: {
      usb: IF.USB(750, 0.500),
    } } },
  },
};

// Battery groups -- shown in the "Type" selector above the battery
// dropdown to keep the list manageable.
const BATTERY_GROUPS = {
  lipo_ada: "LiPo (Adafruit)",
  lipo_sf:  "LiPo (SparkFun)",
  alkaline: "Alkaline",
  lithium:  "Lithium",
  custom:   "Custom",
};

// Default battery selected when the user lands on each group. Picks a
// "typical" cell so users don't have to scroll through tiny / huge
// extremes before getting an estimate.
const BATTERY_DEFAULT = {
  lipo_ada: "lipo_2011",     // Adafruit 2011, 2000 mAh
  lipo_sf:  "lipo_prt13855", // SparkFun PRT-13855, 2000 mAh
  alkaline: "alk_2x_aa",     // 2x AA alkaline, 2400 mAh
  lithium:  "li_2x_aa",      // 2x AA Li-FeS2, 3000 mAh
  custom:   "custom",
};

// Battery presets. derate = usable fraction of nameplate capacity at
// moderate (<= 1C) discharge rates.
//
// LiPo entries are off-the-shelf cells from Adafruit (numeric part #) and
// SparkFun (PRT-####).
//
// Alkaline / lithium capacity numbers are typical nameplate values:
//   AAA  1000 mAh  | AA  2400 mAh | C  8000 mAh | D  17000 mAh
//   AA Li-FeS2 (Energizer Ultimate Lithium) ~ 3000 mAh
//
// 2x / 3x stacks share the capacity of one cell but multiply voltage
// (1.5V per alkaline / Li-FeS2 cell).
const BATTERIES = {
  // ---- LiPo (1S, 3.7V), Adafruit, smallest to largest ----
  lipo_570:      { group: "lipo_ada", name: "LiPo Adafruit 570 - 100mAh",        mAh: 100,   v: 3.7, derate: 0.85 },
  lipo_1317:     { group: "lipo_ada", name: "LiPo Adafruit 1317 - 150mAh",       mAh: 150,   v: 3.7, derate: 0.85 },
  lipo_4237:     { group: "lipo_ada", name: "LiPo Adafruit 4237 - 350mAh",       mAh: 350,   v: 3.7, derate: 0.85 },
  lipo_2750:     { group: "lipo_ada", name: "LiPo Adafruit 2750 - 350mAh",       mAh: 350,   v: 3.7, derate: 0.85 },
  lipo_3898:     { group: "lipo_ada", name: "LiPo Adafruit 3898 - 400mAh",       mAh: 400,   v: 3.7, derate: 0.85 },
  lipo_4236:     { group: "lipo_ada", name: "LiPo Adafruit 4236 - 420mAh",       mAh: 420,   v: 3.7, derate: 0.85 },
  lipo_1578:     { group: "lipo_ada", name: "LiPo Adafruit 1578 - 500mAh",       mAh: 500,   v: 3.7, derate: 0.85 },
  lipo_258:      { group: "lipo_ada", name: "LiPo Adafruit 258 - 1200mAh",       mAh: 1200,  v: 3.7, derate: 0.85 },
  lipo_2011:     { group: "lipo_ada", name: "LiPo Adafruit 2011 - 2000mAh",      mAh: 2000,  v: 3.7, derate: 0.85 },
  lipo_1781:     { group: "lipo_ada", name: "LiPo Adafruit 1781 - 2200mAh",      mAh: 2200,  v: 3.7, derate: 0.85 },
  lipo_328:      { group: "lipo_ada", name: "LiPo Adafruit 328 - 2500mAh",       mAh: 2500,  v: 3.7, derate: 0.85 },
  lipo_354:      { group: "lipo_ada", name: "LiPo Adafruit 354 - 4400mAh",       mAh: 4400,  v: 3.7, derate: 0.85 },
  lipo_353:      { group: "lipo_ada", name: "LiPo Adafruit 353 - 6600mAh",       mAh: 6600,  v: 3.7, derate: 0.85 },
  lipo_5035:     { group: "lipo_ada", name: "LiPo Adafruit 5035 - 10050mAh",     mAh: 10050, v: 3.7, derate: 0.85 },

  // ---- LiPo (1S, 3.7V), SparkFun, smallest to largest ----
  lipo_prt13852: { group: "lipo_sf", name: "LiPo SparkFun PRT-13852 - 40mAh",    mAh: 40,    v: 3.7, derate: 0.85 },
  lipo_prt13853: { group: "lipo_sf", name: "LiPo SparkFun PRT-13853 - 110mAh",   mAh: 110,   v: 3.7, derate: 0.85 },
  lipo_prt13851: { group: "lipo_sf", name: "LiPo SparkFun PRT-13851 - 400mAh",   mAh: 400,   v: 3.7, derate: 0.85 },
  lipo_prt13854: { group: "lipo_sf", name: "LiPo SparkFun PRT-13854 - 850mAh",   mAh: 850,   v: 3.7, derate: 0.85 },
  lipo_prt18286: { group: "lipo_sf", name: "LiPo SparkFun PRT-18286 - 1250mAh",  mAh: 1250,  v: 3.7, derate: 0.85 },
  lipo_prt26059: { group: "lipo_sf", name: "LiPo SparkFun PRT-26059 - 1500mAh",  mAh: 1500,  v: 3.7, derate: 0.85 },
  lipo_prt13855: { group: "lipo_sf", name: "LiPo SparkFun PRT-13855 - 2000mAh",  mAh: 2000,  v: 3.7, derate: 0.85 },
  lipo_prt13856: { group: "lipo_sf", name: "LiPo SparkFun PRT-13856 - 6000mAh",  mAh: 6000,  v: 3.7, derate: 0.85 },

  // ---- Alkaline (1.5V/cell nominal, 0.70 usable), 2x then 3x ----
  // 4x stacks sit at the on-board chips' 6V absolute-maximum rating at
  // nominal voltage (4 x 1.5V = 6.0V) and exceed it on fresh cells
  // (4 x ~1.65-1.8V ~ 6.6-7.2V), so they are intentionally omitted.
  alk_2x_aaa: { group: "alkaline", name: "2x AAA alkaline (3.0V)",  mAh: 1000,  v: 3.0, derate: 0.70 },
  alk_2x_aa:  { group: "alkaline", name: "2x AA alkaline (3.0V)",   mAh: 2400,  v: 3.0, derate: 0.70 },
  alk_2x_c:   { group: "alkaline", name: "2x C alkaline (3.0V)",    mAh: 8000,  v: 3.0, derate: 0.70 },
  alk_2x_d:   { group: "alkaline", name: "2x D alkaline (3.0V)",    mAh: 17000, v: 3.0, derate: 0.70 },
  alk_3x_aaa: { group: "alkaline", name: "3x AAA alkaline (4.5V)",  mAh: 1000,  v: 4.5, derate: 0.70 },
  alk_3x_aa:  { group: "alkaline", name: "3x AA alkaline (4.5V)",   mAh: 2400,  v: 4.5, derate: 0.70 },
  alk_3x_c:   { group: "alkaline", name: "3x C alkaline (4.5V)",    mAh: 8000,  v: 4.5, derate: 0.70 },
  alk_3x_d:   { group: "alkaline", name: "3x D alkaline (4.5V)",    mAh: 17000, v: 4.5, derate: 0.70 },

  // ---- Lithium Li-FeS2 (1.5V/cell nominal, 0.85 usable), 2x then 3x ----
  // 4x stacks omitted for the same reason as the alkaline 4x entries.
  li_2x_aaa: { group: "lithium", name: "2x AAA Li-FeS2 (3.0V)", mAh: 1200,  v: 3.0, derate: 0.85 },
  li_2x_aa:  { group: "lithium", name: "2x AA Li-FeS2 (3.0V)",  mAh: 3000,  v: 3.0, derate: 0.85 },
  li_2x_c:   { group: "lithium", name: "2x C Li-FeS2 (3.0V)",   mAh: 8500,  v: 3.0, derate: 0.85 },
  li_2x_d:   { group: "lithium", name: "2x D Li-FeS2 (3.0V)",   mAh: 17000, v: 3.0, derate: 0.85 },
  li_3x_aaa: { group: "lithium", name: "3x AAA Li-FeS2 (4.5V)", mAh: 1200,  v: 4.5, derate: 0.85 },
  li_3x_aa:  { group: "lithium", name: "3x AA Li-FeS2 (4.5V)",  mAh: 3000,  v: 4.5, derate: 0.85 },
  li_3x_c:   { group: "lithium", name: "3x C Li-FeS2 (4.5V)",   mAh: 8500,  v: 4.5, derate: 0.85 },
  li_3x_d:   { group: "lithium", name: "3x D Li-FeS2 (4.5V)",   mAh: 17000, v: 4.5, derate: 0.85 },

  // ---- Custom ----
  custom: { group: "custom", name: "Custom...", custom: true },
};

// ---------------------------------------------------------------------------
// DOM glue
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

const boardSel   = $("bl-board");
const shieldSel  = $("bl-shield");
const ifaceSel   = $("bl-interface");
const ifaceHint  = $("bl-interface-hint");
const activeVal  = $("bl-active-val");
const activeUnit = $("bl-active-unit");
const sleepVal   = $("bl-sleep-val");
const sleepUnit  = $("bl-sleep-unit");
const batteryGroupSel   = $("bl-battery-group");
const batterySel        = $("bl-battery");
const batteryGroupField = $("bl-battery-group-field");
const batteryField      = $("bl-battery-field");
const customBox         = $("bl-custom-battery");
const customMah  = $("bl-custom-mah");
const customV    = $("bl-custom-v");
const customDe   = $("bl-custom-derate");

const outActive  = $("bl-out-active");
const outSleep   = $("bl-out-sleep");
const outAvg     = $("bl-out-avg");
const outRun     = $("bl-out-runtime");
const disclaimer = $("bl-disclaimer");
const shareBtn   = $("bl-share-btn");
const shareMsg   = $("bl-share-msg");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Refill a <select> with the given (id, label) entries.
//   - Preserves the previously-selected id if it's still in the new list.
//   - Falls back to `opts.default` if provided and present in the list.
//   - Otherwise leaves the first option selected (browser default).
function fillSelect(sel, entries, opts = {}) {
  const prev = sel.value;
  sel.innerHTML = "";
  for (const [id, label] of entries) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    sel.appendChild(opt);
  }
  const ids = entries.map(([id]) => id);
  if (ids.includes(prev)) {
    sel.value = prev;
  } else if (opts.default && ids.includes(opts.default)) {
    sel.value = opts.default;
  }
}

function currentBoard()     { return BOARDS[boardSel.value]; }
function currentShield()    { return currentBoard().shields[shieldSel.value]; }
function currentInterface() { return currentShield().interfaces[ifaceSel.value]; }
function currentBattery()   { return BATTERIES[batterySel.value]; }

function formatPower(W) {
  if (!isFinite(W)) return "—";
  if (W < 1e-3)  return (W * 1e6).toFixed(1) + " µW";
  if (W < 1)     return (W * 1000).toFixed(2) + " mW";
  return W.toFixed(2) + " W";
}

function formatRuntime(hours) {
  if (!isFinite(hours) || hours <= 0) return "—";
  const seconds = hours * 3600;
  if (seconds < 60)     return seconds.toFixed(1) + " s";
  const minutes = hours * 60;
  if (minutes < 60)     return minutes.toFixed(1) + " min";
  if (hours < 48)       return hours.toFixed(1) + " hr";
  const days = hours / 24;
  if (days < 60)        return days.toFixed(1) + " days";
  const months = days / 30.44;
  if (months < 24)      return months.toFixed(1) + " months";
  return (months / 12).toFixed(1) + " years";
}

// ---------------------------------------------------------------------------
// Master refresh
// ---------------------------------------------------------------------------
//
// One function that re-fills every cascaded select, re-runs every show/hide
// rule, and recomputes the estimate. Called on any combo-box change so the
// UI is always coherent, regardless of which selector the user touched.

// Tracks the (board, shield, interface) triple so refresh() can detect
// when the user has actually picked a different power input.
let lastIfaceKey = null;
// Tracks whether the custom panel was visible on the previous refresh;
// used to reset the custom fields whenever the user re-enters the
// custom panel from a non-custom battery.
let customWasVisible = false;

function refresh() {
  // ----- Shield -----
  // Refill based on the selected board; hide the whole step if there's
  // only one shield option (i.e., "(no shield)").
  const board = currentBoard();
  const shieldEntries = Object.entries(board.shields);
  fillSelect(shieldSel, shieldEntries.map(([id, s]) => [id, s.name]));

  const shieldStep = document.querySelector('[data-step="2"]');
  if (shieldStep) shieldStep.hidden = shieldEntries.length <= 1;

  // ----- Interface -----
  // Refill based on the selected shield.
  const shield = currentShield();
  fillSelect(ifaceSel,
    Object.entries(shield.interfaces).map(([id, i]) => [id, i.name]));

  // ----- Interface hint -----
  const iface = currentInterface();
  ifaceHint.textContent = iface.hint || "";

  // ----- Power-input change detection -----
  // Reset the custom-battery fields whenever the user has just picked
  // a different (board, shield, interface) triple. The old custom
  // values almost never make sense at the new interface (different
  // voltage rail, different power-bank use case, etc.).
  const ifaceKey = boardSel.value + "/" + shieldSel.value + "/" + ifaceSel.value;
  const ifaceChanged = ifaceKey !== lastIfaceKey;
  lastIfaceKey = ifaceKey;

  // ----- Battery type -----
  // Filter to the groups allowed for this interface. Hide the Type
  // selector when the interface only allows one group (it's not a
  // choice).
  const allowed = iface.allowedBatteryGroups || ["custom"];
  fillSelect(batteryGroupSel,
    allowed.map((id) => [id, BATTERY_GROUPS[id]]));
  batteryGroupField.hidden = allowed.length <= 1;

  // ----- Battery -----
  // Filter to the batteries in the selected group; pick the group's
  // default if the previously-selected battery isn't in the new list.
  // Hide the Battery selector when the group is "custom" -- the only
  // entry is "Custom..." which duplicates the Type label.
  const group = batteryGroupSel.value;
  const batteryEntries = Object.entries(BATTERIES).filter(
    ([, b]) => b.group === group);
  fillSelect(batterySel,
    batteryEntries.map(([id, b]) => [id, b.name]),
    { default: BATTERY_DEFAULT[group] });
  batteryField.hidden = group === "custom";

  // ----- Custom-battery inputs visibility -----
  // Reset the custom fields whenever the user re-enters the custom
  // panel from a non-custom battery, OR when the interface changed.
  // While the panel stays visible across non-interface refreshes
  // (e.g. duty-cycle edits), manual edits are preserved.
  const customNowVisible = batterySel.value === "custom";
  const enteringCustom = customNowVisible && !customWasVisible;
  customBox.hidden = !customNowVisible;
  if (ifaceChanged || enteringCustom) {
    customMah.value = 2000;
    customV.value   = iface.v_supply;
    customDe.value  = 0.85;
  }
  customWasVisible = customNowVisible;

  // ----- Step numbering -----
  relabelSteps();

  // ----- Result panel -----
  recompute();
}

// Renumber the visible step chips so the user sees 1..N regardless of
// which steps are hidden.
function relabelSteps() {
  let n = 1;
  document.querySelectorAll(".bl-step").forEach((step) => {
    if (step.hidden) return;
    const chip = step.querySelector(".bl-num");
    if (chip) chip.textContent = n;
    n++;
  });
}

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

function recompute() {
  const iface = currentInterface();
  if (!iface) return;

  outActive.textContent = formatPower(iface.active_mW / 1000);
  outSleep.textContent  = formatPower(iface.sleep_mW / 1000);

  const tA = (parseFloat(activeVal.value) || 0) * parseFloat(activeUnit.value);
  const tS = (parseFloat(sleepVal.value)  || 0) * parseFloat(sleepUnit.value);
  const tT = tA + tS;

  if (tT <= 0) {
    outAvg.textContent = "—";
    outRun.textContent = "—";
    disclaimer.classList.remove("show");
    return;
  }

  const avg_mW = (iface.active_mW * tA + iface.sleep_mW * tS) / tT;
  const avg_W  = avg_mW / 1000;
  outAvg.textContent = formatPower(avg_W);

  // Pull battery parameters.
  const bat = currentBattery();
  let mAh, v, derate, batCustom, batV;
  if (bat.custom) {
    mAh    = Math.max(0, parseFloat(customMah.value) || 0);
    v      = Math.max(0, parseFloat(customV.value)   || 0);
    derate = Math.min(1, Math.max(0, parseFloat(customDe.value) || 0));
    batCustom = true;
    batV = v;
  } else {
    mAh    = bat.mAh;
    v      = bat.v;
    derate = bat.derate;
    batCustom = false;
    batV = bat.v;
  }
  const usable_Wh = (mAh * v * derate) / 1000;
  const hours     = usable_Wh / avg_W;
  outRun.textContent = formatRuntime(hours);

  applyVoltageWarning(iface, batCustom, batV);
}

// Warn when the battery's nominal voltage is outside the interface's
// accepted input range.
function applyVoltageWarning(iface, batCustom, batV) {
  if (batCustom) {
    disclaimer.classList.remove("show");
    return;
  }
  const hasRange = iface.v_supply_min != null && iface.v_supply_max != null;
  const vmin = hasRange ? iface.v_supply_min : iface.v_supply - 1.0;
  const vmax = hasRange ? iface.v_supply_max : iface.v_supply + 1.0;
  if (batV < vmin || batV > vmax) {
    const range = hasRange
      ? iface.v_supply_min.toFixed(1) + "-" + iface.v_supply_max.toFixed(1) + "V"
      : "~" + iface.v_supply.toFixed(1) + "V";
    disclaimer.textContent =
      "Voltage mismatch: this battery (" + batV.toFixed(1) +
      " V) is outside the interface's input range (" + range +
      "). Check that the board's input regulator can accept this voltage.";
    disclaimer.classList.add("show");
    return;
  }
  disclaimer.classList.remove("show");
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

// Cascade-reset semantics. Each combo-box change wipes the value of
// every selector below it, so the downstream selectors fall back to
// their per-context defaults instead of carrying stale picks across an
// upstream change.
//
//   board   change -> reset shield, interface, battery type, battery
//   shield  change -> reset interface, battery type, battery
//   iface   change -> reset battery type, battery
//   group   change -> reset battery
//   battery change -> nothing to reset
function resetBelow(level) {
  if (level === "board") {
    shieldSel.value = "";
    ifaceSel.value = "";
    batteryGroupSel.value = "";
    batterySel.value = "";
  } else if (level === "shield") {
    ifaceSel.value = "";
    batteryGroupSel.value = "";
    batterySel.value = "";
  } else if (level === "iface") {
    batteryGroupSel.value = "";
    batterySel.value = "";
  } else if (level === "group") {
    batterySel.value = "";
  }
}

function init() {
  fillSelect(boardSel,
    Object.entries(BOARDS).map(([id, b]) => [id, b.name]));

  // Single cascade: refresh() refills every dependent select, re-runs
  // every visibility rule, and recomputes the estimate.
  refresh();

  // Restore state from URL hash if present (board first, then cascade
  // refresh, then apply remaining state). Done after the initial
  // refresh() so all selects are populated.
  applyHashState();

  // ---- Cascade listeners ----
  boardSel.addEventListener("change",        () => { resetBelow("board");  refresh(); writeHash(); });
  shieldSel.addEventListener("change",       () => { resetBelow("shield"); refresh(); writeHash(); });
  ifaceSel.addEventListener("change",        () => { resetBelow("iface");  refresh(); writeHash(); });
  batteryGroupSel.addEventListener("change", () => { resetBelow("group");  refresh(); writeHash(); });
  batterySel.addEventListener("change",      () => { refresh(); writeHash(); });

  // ---- Duty-cycle / custom-battery inputs ----
  for (const el of [activeVal, activeUnit, sleepVal, sleepUnit,
                    customMah, customV, customDe]) {
    el.addEventListener("input",  () => { recompute(); writeHash(); });
    el.addEventListener("change", () => { recompute(); writeHash(); });
  }

  // ---- Share button ----
  if (shareBtn) {
    shareBtn.addEventListener("click", copyShareLink);
  }

  setupHeightSync();
}

// ---------------------------------------------------------------------------
// URL hash sync (serialise / deserialise the calculator state)
// ---------------------------------------------------------------------------
//
// The current selections are mirrored into location.hash so users can
// share a permalink (or refresh the page and not lose their work). The
// hash is a query-string-style payload, e.g.:
//
//   #board=n6&shield=battery_shield&iface=lipo
//   &active=5s&sleep=15m&group=lipo_ada&battery=lipo_2011
//
// Missing fields keep their defaults on read.

const HASH_PREFIX = "#";

// Encode a (val, unit) duration as e.g. "5s", "15m", "2h", "1d", "1y".
function encodeDuration(val, unitSec) {
  const unit = parseFloat(unitSec);
  if (unit === 1)        return val + "s";
  if (unit === 60)       return val + "m";
  if (unit === 3600)     return val + "h";
  if (unit === 86400)    return val + "d";
  if (unit === 2629800)  return val + "M";
  if (unit === 31557600) return val + "y";
  return val + "s";
}
function decodeDuration(s) {
  const m = /^(-?[\d.]+)([smhdMy])$/.exec(s || "");
  if (!m) return null;
  const v = m[1];
  const unitFor = { s: 1, m: 60, h: 3600, d: 86400, M: 2629800, y: 31557600 };
  return { val: v, unit: String(unitFor[m[2]]) };
}

function writeHash() {
  const parts = [];
  parts.push("board=" + encodeURIComponent(boardSel.value));
  parts.push("shield=" + encodeURIComponent(shieldSel.value));
  parts.push("iface=" + encodeURIComponent(ifaceSel.value));
  parts.push("active=" + encodeDuration(activeVal.value, activeUnit.value));
  parts.push("sleep=" + encodeDuration(sleepVal.value, sleepUnit.value));
  parts.push("group=" + encodeURIComponent(batteryGroupSel.value));
  parts.push("battery=" + encodeURIComponent(batterySel.value));
  if (batterySel.value === "custom") {
    parts.push("mah=" + encodeURIComponent(customMah.value));
    parts.push("v="   + encodeURIComponent(customV.value));
    parts.push("d="   + encodeURIComponent(customDe.value));
  }
  const newHash = HASH_PREFIX + parts.join("&");
  // Use replaceState so the back button doesn't fill up with every keystroke.
  if (location.hash !== newHash) {
    history.replaceState(null, "", newHash);
  }
}

function parseHash() {
  const h = location.hash.replace(/^#/, "");
  if (!h) return null;
  const out = {};
  for (const pair of h.split("&")) {
    const [k, v] = pair.split("=");
    if (k) out[k] = decodeURIComponent(v || "");
  }
  return out;
}

function applyHashState() {
  const s = parseHash();
  if (!s) return;

  // Apply board first; downstream selects get filled by refresh().
  if (s.board && BOARDS[s.board]) boardSel.value = s.board;
  refresh();

  if (s.shield) { shieldSel.value = s.shield; refresh(); }
  if (s.iface)  { ifaceSel.value  = s.iface;  refresh(); }

  if (s.sleep) {
    const d = decodeDuration(s.sleep);
    if (d) { sleepVal.value = d.val; sleepUnit.value = d.unit; }
  }
  if (s.active) {
    const d = decodeDuration(s.active);
    if (d) { activeVal.value = d.val; activeUnit.value = d.unit; }
  }

  if (s.group) { batteryGroupSel.value = s.group; refresh(); }
  if (s.battery) { batterySel.value = s.battery; refresh(); }

  if (batterySel.value === "custom") {
    if (s.mah) customMah.value = s.mah;
    if (s.v)   customV.value   = s.v;
    if (s.d)   customDe.value  = s.d;
  }

  recompute();
}

function copyShareLink() {
  // The iframe URL with the current hash is what we want to share.
  writeHash();
  const url = location.href;
  const done = (ok) => {
    shareMsg.textContent = ok ? "Link copied!" : "Copy failed -- " + url;
    setTimeout(() => { shareMsg.textContent = ""; }, 3000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
  } else {
    // Fallback for older browsers / iframe sandboxes without clipboard
    // permission: select the URL in a transient textarea and execCommand.
    const ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      done(ok);
    } catch (e) {
      done(false);
    } finally {
      document.body.removeChild(ta);
    }
  }
}

// ---------------------------------------------------------------------------
// Iframe height auto-sync
// ---------------------------------------------------------------------------
//
// When embedded in an iframe, broadcast our content height to the parent so
// the parent can resize the frame and avoid an internal scrollbar.
//
// Parent-side listener (paste into the embedding page):
//
//     window.addEventListener("message", function (e) {
//       if (e.data && e.data.type === "openmv-battery-life-height") {
//         var f = document.getElementById("openmv-battery-life-iframe");
//         if (f) f.style.height = e.data.height + "px";
//       }
//     });
//
// The iframe should have id="openmv-battery-life-iframe" or the parent
// listener should select it however it likes.

// Mirror the parent docs page's theme. The Shibuya docs theme uses
// html.dark / html.light for its manual color-mode toggle, which the
// iframe can't see via prefers-color-scheme. When the parent is
// same-origin we read its <html> classes directly and watch for
// future toggles via MutationObserver. When cross-origin (e.g.
// embedded on openmv.io from docs.openmv.io) we fall back to
// prefers-color-scheme.
function syncParentTheme() {
  const apply = (theme) => {
    const r = document.documentElement;
    r.classList.toggle("bl-dark",  theme === "dark");
    r.classList.toggle("bl-light", theme === "light");
  };
  const fromParent = () => {
    try {
      const p = window.parent.document.documentElement;
      if (p.classList.contains("dark"))  return "dark";
      if (p.classList.contains("light")) return "light";
    } catch (e) {
      // cross-origin -- can't read parent
    }
    return null;
  };

  const parentTheme = fromParent();
  if (parentTheme) {
    apply(parentTheme);
    // Watch for live toggles of the parent's html class.
    try {
      new MutationObserver(() => {
        const t = fromParent();
        if (t) apply(t);
      }).observe(window.parent.document.documentElement,
                 { attributes: true, attributeFilter: ["class"] });
    } catch (e) { /* ignore */ }
  } else if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mql.matches ? "dark" : "light");
    mql.addEventListener("change", (e) => apply(e.matches ? "dark" : "light"));
  }
}

function setupHeightSync() {
  if (window.parent === window) return; // not embedded; nothing to do

  // Mark the root so CSS can opt-in to embedded-only layout tweaks
  // (e.g. dropping the standalone-only vertical padding on .bl-app).
  document.documentElement.classList.add("bl-embedded");

  // Hide the in-iframe header when embedded -- the embedding page
  // (docs site, openmv.io) provides its own heading and the duplicate
  // looks wrong. Standalone access (URL opened directly) keeps it.
  const hdr = document.getElementById("bl-header");
  if (hdr) hdr.hidden = true;

  // Mirror the parent docs page's theme.
  syncParentTheme();

  let lastHeight = 0;
  const post = () => {
    // body.scrollHeight tracks our actual content size; html / document
    // element scrollHeight gets clamped by the iframe-imposed viewport,
    // so it doesn't shrink when content gets shorter.
    const h = document.body.scrollHeight;
    if (h === lastHeight) return;
    lastHeight = h;
    window.parent.postMessage(
      { type: "openmv-battery-life-height", height: h },
      "*",
    );
  };

  // Initial + after layout settles.
  post();
  requestAnimationFrame(post);

  // Re-broadcast on any layout change. ResizeObserver on the body catches
  // both grow- and shrink-side content-size changes; we additionally
  // watch for `hidden` attribute toggles via MutationObserver because
  // some browsers don't surface display:none toggles as ResizeObserver
  // entries on the parent box.
  if ("ResizeObserver" in window) {
    new ResizeObserver(post).observe(document.body);
  } else {
    setInterval(post, 500);
  }
  if ("MutationObserver" in window) {
    new MutationObserver(post).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
      childList: true,
    });
  }
  window.addEventListener("load", post);
}

document.addEventListener("DOMContentLoaded", init);
