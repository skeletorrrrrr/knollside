// The heart of Knollside's multi-vertical design.
//
// Each industry defines: the words the UI uses ("materials" vs "services"),
// what the main quantity input measures (area / hours / count / none), and a
// set of starter items a new business is seeded with. Everything a business
// sees is still fully editable afterward — the industry pick only chooses the
// starting labels + template, never locks anything in.
//
// quantity_type drives the pricing math AND the customer widget input:
//   area  -> a number the base rate is multiplied by (sq ft, sq m)
//   hours -> a number the base rate is multiplied by (labor hours)
//   count -> a number the base rate is multiplied by (units, rooms, panels)
//   none  -> no multiplier; price is purely items + add-ons (flat-rate shops)

export const INDUSTRIES = {
  countertops: {
    id: "countertops",
    label: "Countertops / Stone",
    quantity_type: "area",
    // wording shown throughout the app
    terms: {
      item: "material",        // singular
      items: "materials",      // section heading
      itemPrice: "price per sq ft",
      option: "edge finish",   // the "edges" concept, generalized
      options: "edge finishes",
      optionPrice: "upcharge per sq ft",
      quantity: "Countertop size",
      quantityUnit: "sq ft",
      laborLabel: "Labor rate",
      laborUnit: "/sq ft",
    },
    quantity: { min: 5, max: 500, default: 30 },
    starter: {
      // Deliberately round. Numbers like 55 / 65 / 85 read as an attempt at
      // this shop's real pricing that got it wrong; 50 / 60 / 80 read as
      // examples waiting to be replaced. Same job, and one of them doesn't
      // make a stranger think you misjudged their business.
      items: [
        { name: "Granite", base_price: 50 },
        { name: "Quartz", base_price: 60 },
        { name: "Marble", base_price: 80 },
      ],
      options: [
        { name: "Straight", upcharge: 0 },
        { name: "Beveled", upcharge: 5 },
        { name: "Bullnose", upcharge: 10 },
      ],
      addons: [
        { name: "Sink cutout", price: 150, billing_type: "flat", unit_label: "" },
        { name: "Backsplash", price: 20, billing_type: "unit", unit_label: "linear ft" },
      ],
      labor_rate: 10,
    },
  },

  mechanics: {
    id: "mechanics",
    label: "Auto Mechanics / Repair",
    quantity_type: "hours",
    terms: {
      item: "service",
      items: "services & parts",
      itemPrice: "price per hour",
      option: "vehicle type",
      options: "vehicle types",
      optionPrice: "rate adjustment per hour",
      quantity: "Estimated labor",
      quantityUnit: "hours",
      laborLabel: "Shop rate",
      laborUnit: "/hour",
    },
    quantity: { min: 0.5, max: 12, default: 2 },
    starter: {
      items: [
        { name: "Brake job (per axle)", base_price: 90 },
        { name: "Oil & filter change", base_price: 40 },
        { name: "Diagnostic", base_price: 110 },
      ],
      options: [
        { name: "Sedan / compact", upcharge: 0 },
        { name: "SUV / truck", upcharge: 15 },
        { name: "Luxury / European", upcharge: 35 },
      ],
      addons: [
        { name: "Shop supplies fee", price: 25, billing_type: "flat", unit_label: "" },
        { name: "Additional part", price: 60, billing_type: "unit", unit_label: "each" },
      ],
      labor_rate: 95,
    },
  },

  auto_glass: {
    id: "auto_glass",
    label: "Auto Glass",
    quantity_type: "none",
    terms: {
      item: "service",
      items: "services",
      itemPrice: "price",
      option: "vehicle size",
      options: "vehicle sizes",
      optionPrice: "upcharge",
      quantity: "",
      quantityUnit: "",
      laborLabel: "Base fee",
      laborUnit: "",
    },
    quantity: { min: 1, max: 1, default: 1 },
    starter: {
      items: [
        { name: "Chip / crack repair", base_price: 80 },
        { name: "Windshield replacement", base_price: 350 },
        { name: "Side or back glass", base_price: 320 },
      ],
      options: [
        { name: "Sedan / coupe", upcharge: 0 },
        { name: "SUV / minivan", upcharge: 80 },
        { name: "Truck / large van", upcharge: 180 },
      ],
      addons: [
        { name: "ADAS camera calibration", price: 400, billing_type: "flat", unit_label: "" },
        { name: "Mobile service (we come to you)", price: 50, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 0,
    },
  },
  cleaning: {
    id: "cleaning",
    label: "Cleaning / Janitorial",
    quantity_type: "area",
    terms: {
      item: "service package",
      items: "service packages",
      itemPrice: "price per sq ft",
      option: "property type",
      options: "property types",
      optionPrice: "adjustment per sq ft",
      quantity: "Property size",
      quantityUnit: "sq ft",
      laborLabel: "Base labor rate",
      laborUnit: "/sq ft",
    },
    quantity: { min: 200, max: 8000, default: 1200 },
    starter: {
      items: [
        { name: "Standard clean", base_price: 0.12 },
        { name: "Deep clean", base_price: 0.22 },
        { name: "Move-out clean", base_price: 0.3 },
      ],
      options: [
        { name: "Apartment / condo", upcharge: 0 },
        { name: "House", upcharge: 0.03 },
        { name: "Office", upcharge: 0.05 },
      ],
      addons: [
        { name: "Interior windows", price: 60, billing_type: "flat", unit_label: "" },
        { name: "Extra bathroom", price: 25, billing_type: "unit", unit_label: "each" },
      ],
      labor_rate: 0.05,
    },
  },

  landscaping: {
    id: "landscaping",
    label: "Landscaping / Lawn Care",
    quantity_type: "count",
    terms: {
      item: "service",
      items: "services",
      itemPrice: "price per visit",
      option: "yard size",
      options: "yard sizes",
      optionPrice: "adjustment per visit",
      quantity: "Number of visits",
      quantityUnit: "visits",
      laborLabel: "Base crew rate",
      laborUnit: "/visit",
    },
    quantity: { min: 1, max: 52, default: 4 },
    starter: {
      items: [
        { name: "Mow & edge", base_price: 45 },
        { name: "Full yard cleanup", base_price: 180 },
        { name: "Hedge trimming", base_price: 90 },
      ],
      options: [
        { name: "Small (under 1/4 acre)", upcharge: 0 },
        { name: "Medium (1/4–1/2 acre)", upcharge: 20 },
        { name: "Large (1/2+ acre)", upcharge: 50 },
      ],
      addons: [
        { name: "Leaf removal", price: 75, billing_type: "flat", unit_label: "" },
        { name: "Mulch", price: 40, billing_type: "unit", unit_label: "cubic yard" },
      ],
      labor_rate: 0,
    },
  },

  roofing: {
    id: "roofing",
    label: "Roofing",
    quantity_type: "area",
    terms: {
      item: "roof type", items: "roof types", itemPrice: "price per sq ft",
      option: "pitch", options: "roof pitches", optionPrice: "adjustment per sq ft",
      quantity: "Roof size", quantityUnit: "sq ft",
      laborLabel: "Labor rate", laborUnit: "/sq ft",
    },
    quantity: { min: 200, max: 6000, default: 1500 },
    starter: {
      items: [
        { name: "Asphalt shingle", base_price: 4.5 },
        { name: "Metal", base_price: 9 },
        { name: "Tile", base_price: 12 },
      ],
      options: [
        { name: "Low slope", upcharge: 0 },
        { name: "Medium slope", upcharge: 1 },
        { name: "Steep slope", upcharge: 2.5 },
      ],
      addons: [
        { name: "Tear-off / removal", price: 1.5, billing_type: "unit", unit_label: "sq ft" },
        { name: "Gutter replacement", price: 8, billing_type: "unit", unit_label: "linear ft" },
      ],
      labor_rate: 3,
    },
  },

  plumbing: {
    id: "plumbing",
    label: "Plumbing",
    quantity_type: "hours",
    terms: {
      item: "service", items: "services", itemPrice: "price per hour",
      option: "property type", options: "property types", optionPrice: "adjustment per hour",
      quantity: "Estimated labor", quantityUnit: "hours",
      laborLabel: "Hourly rate", laborUnit: "/hour",
    },
    quantity: { min: 0.5, max: 12, default: 2 },
    starter: {
      items: [
        { name: "Leak repair", base_price: 0 },
        { name: "Water heater install", base_price: 0 },
        { name: "Drain cleaning", base_price: 0 },
      ],
      options: [
        { name: "Residential", upcharge: 0 },
        { name: "Commercial", upcharge: 25 },
        { name: "Emergency / after-hours", upcharge: 75 },
      ],
      addons: [
        { name: "Parts & materials", price: 80, billing_type: "flat", unit_label: "" },
        { name: "Permit fee", price: 60, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 120,
    },
  },

  hvac: {
    id: "hvac",
    label: "HVAC / Heating & Cooling",
    quantity_type: "hours",
    terms: {
      item: "service", items: "services", itemPrice: "price per hour",
      option: "system type", options: "system types", optionPrice: "adjustment per hour",
      quantity: "Estimated labor", quantityUnit: "hours",
      laborLabel: "Hourly rate", laborUnit: "/hour",
    },
    quantity: { min: 0.5, max: 16, default: 3 },
    starter: {
      items: [
        { name: "Tune-up / maintenance", base_price: 0 },
        { name: "Repair", base_price: 0 },
        { name: "New system install", base_price: 0 },
      ],
      options: [
        { name: "Central air", upcharge: 0 },
        { name: "Heat pump", upcharge: 15 },
        { name: "Ductless mini-split", upcharge: 20 },
      ],
      addons: [
        { name: "Refrigerant", price: 120, billing_type: "flat", unit_label: "" },
        { name: "New thermostat", price: 180, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 110,
    },
  },

  electrical: {
    id: "electrical",
    label: "Electrical",
    quantity_type: "hours",
    terms: {
      item: "service", items: "services", itemPrice: "price per hour",
      option: "property type", options: "property types", optionPrice: "adjustment per hour",
      quantity: "Estimated labor", quantityUnit: "hours",
      laborLabel: "Hourly rate", laborUnit: "/hour",
    },
    quantity: { min: 0.5, max: 16, default: 2 },
    starter: {
      items: [
        { name: "Outlet / switch install", base_price: 0 },
        { name: "Panel upgrade", base_price: 0 },
        { name: "Lighting install", base_price: 0 },
      ],
      options: [
        { name: "Residential", upcharge: 0 },
        { name: "Commercial", upcharge: 30 },
        { name: "Emergency / after-hours", upcharge: 80 },
      ],
      addons: [
        { name: "Materials & fixtures", price: 100, billing_type: "flat", unit_label: "" },
        { name: "Permit fee", price: 75, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 115,
    },
  },

  pest_control: {
    id: "pest_control",
    label: "Pest Control",
    quantity_type: "count",
    terms: {
      item: "treatment", items: "treatments", itemPrice: "price per visit",
      option: "property size", options: "property sizes", optionPrice: "adjustment per visit",
      quantity: "Number of visits", quantityUnit: "visits",
      laborLabel: "Base rate", laborUnit: "/visit",
    },
    quantity: { min: 1, max: 12, default: 1 },
    starter: {
      items: [
        { name: "General pest treatment", base_price: 120 },
        { name: "Termite treatment", base_price: 400 },
        { name: "Rodent control", base_price: 200 },
      ],
      options: [
        { name: "Small home", upcharge: 0 },
        { name: "Large home", upcharge: 40 },
        { name: "Commercial", upcharge: 100 },
      ],
      addons: [
        { name: "Follow-up visit", price: 60, billing_type: "unit", unit_label: "each" },
        { name: "Exterior barrier", price: 80, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 0,
    },
  },

  moving: {
    id: "moving",
    label: "Moving / Hauling",
    quantity_type: "hours",
    terms: {
      item: "service", items: "services", itemPrice: "price per hour",
      option: "crew size", options: "crew sizes", optionPrice: "adjustment per hour",
      quantity: "Estimated hours", quantityUnit: "hours",
      laborLabel: "Base hourly rate", laborUnit: "/hour",
    },
    quantity: { min: 1, max: 16, default: 4 },
    starter: {
      items: [
        { name: "Local move", base_price: 0 },
        { name: "Loading / unloading only", base_price: 0 },
        { name: "Junk hauling", base_price: 0 },
      ],
      options: [
        { name: "2 movers", upcharge: 0 },
        { name: "3 movers", upcharge: 50 },
        { name: "4 movers", upcharge: 100 },
      ],
      addons: [
        { name: "Packing materials", price: 75, billing_type: "flat", unit_label: "" },
        { name: "Truck fee", price: 150, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 120,
    },
  },

  other: {
    id: "other",
    label: "Other / Custom",
    quantity_type: "area",
    terms: {
      item: "item", items: "items", itemPrice: "price per unit",
      option: "option", options: "options", optionPrice: "price adjustment",
      quantity: "Quantity", quantityUnit: "units",
      laborLabel: "Base rate", laborUnit: "/unit",
    },
    quantity: { min: 1, max: 100, default: 10 },
    // Two starter modes for custom businesses — the signup lets them choose.
    // "blank" seeds nothing; "generic" seeds the sample set below.
    starter: {
      items: [
        { name: "Sample item 1", base_price: 50 },
        { name: "Sample item 2", base_price: 75 },
        { name: "Sample item 3", base_price: 100 },
      ],
      options: [
        { name: "Standard", upcharge: 0 },
        { name: "Premium", upcharge: 20 },
        { name: "Deluxe", upcharge: 50 },
      ],
      addons: [
        { name: "Add-on 1", price: 25, billing_type: "flat", unit_label: "" },
        { name: "Add-on 2", price: 15, billing_type: "unit", unit_label: "each" },
        { name: "Add-on 3", price: 40, billing_type: "flat", unit_label: "" },
      ],
      labor_rate: 10,
    },
  },
};

export const INDUSTRY_LIST = Object.values(INDUSTRIES).map((i) => ({
  id: i.id,
  label: i.label,
}));

export function getIndustry(id) {
  return INDUSTRIES[id] || INDUSTRIES.countertops;
}
