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
    quantity: { min: 10, max: 100, default: 30 },
    starter: {
      items: [
        { name: "Granite", base_price: 55 },
        { name: "Quartz", base_price: 65 },
        { name: "Marble", base_price: 85 },
      ],
      options: [
        { name: "Straight", upcharge: 0 },
        { name: "Beveled", upcharge: 4 },
        { name: "Bullnose", upcharge: 6 },
      ],
      addons: [
        { name: "Sink cutout", price: 150, billing_type: "flat", unit_label: "" },
        { name: "Backsplash", price: 18, billing_type: "unit", unit_label: "linear ft" },
      ],
      labor_rate: 12,
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
};

export const INDUSTRY_LIST = Object.values(INDUSTRIES).map((i) => ({
  id: i.id,
  label: i.label,
}));

export function getIndustry(id) {
  return INDUSTRIES[id] || INDUSTRIES.countertops;
}
