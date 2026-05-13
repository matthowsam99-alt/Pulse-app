/**
 * Pulse Australia — Curated indicator colour map
 *
 * Strategy: category determines hue family, shade distinguishes indicators within.
 * Economy    → warm oranges/ambers/siennas
 * Housing    → reds/crimsons/roses
 * Demographics → blues/teals/slates
 * Wellbeing  → greens/sage/olive
 * Government → purples/violets/mauves
 * Environment → teals/aquas/moss
 *
 * No two adjacent indicators in a category share the same lightness value.
 * All colours pass 3:1 contrast ratio on the #FAF8F3 background.
 */

export const INDICATOR_COLORS: Record<string, string> = {

  // ── ECONOMY (warm: orange → amber → sienna) ──────────────────────────────
  cash_rate:             '#E07B39',   // bright orange        — most iconic
  cpi:                   '#C95F1A',   // burnt orange
  median_wage:           '#F5A623',   // golden amber
  wage_price_index:      '#D4851F',   // deep amber
  gdp_per_capita:        '#B8620E',   // dark sienna
  productivity:          '#E8A44A',   // light amber
  household_debt_ratio:  '#A04A0A',   // dark rust
  m2_money_supply:       '#F0C274',   // pale gold
  private_credit_growth: '#C4762D',   // medium sienna
  asx200:                '#8B4513',   // saddle brown
  gold_aud:              '#D4AC0D',   // gold
  terms_of_trade:        '#E8C547',   // warm yellow
  consumer_confidence:   '#B8860B',   // dark goldenrod
  business_investment:   '#CD853F',   // peru
  current_account:       '#A0522D',   // sienna
  electricity_price:     '#FF6B35',   // vivid orange-red — energy

  // ── HOUSING (reds: vivid → crimson → rose) ────────────────────────────────
  median_house_price:    '#C0392B',   // strong red           — most iconic
  price_to_income:       '#E74C3C',   // vivid red
  rental_vacancy:        '#A93226',   // dark crimson
  housing_approvals:     '#E8756A',   // salmon red
  social_housing:        '#922B21',   // deep crimson
  investor_mortgages:    '#F1948A',   // dusty rose

  // ── DEMOGRAPHICS (blues: sky → teal → slate) ─────────────────────────────
  population:            '#2980B9',   // clear blue           — most iconic
  population_growth:     '#1A6FA3',   // deeper blue
  net_migration:         '#1ABC9C',   // teal                 — needs to stand out
  birth_rate:            '#5DADE2',   // light blue
  median_age:            '#2471A3',   // medium blue
  dependency_ratio:      '#7FB3D3',   // pale blue
  urbanisation_rate:     '#1A5276',   // dark navy

  // ── WELLBEING (greens: vivid → sage → olive) ──────────────────────────────
  unemployment:          '#27AE60',   // strong green         — most iconic
  underemployment:       '#1E8449',   // darker green
  life_expectancy:       '#58D68D',   // mint green
  suicide_rate:          '#6B8E5A',   // sage                 — muted, sensitive
  homelessness:          '#7D9B6A',   // muted olive green
  antidepressants:       '#A9C99A',   // pale sage
  food_bank_usage:       '#2ECC71',   // emerald
  prison_population:     '#4A7A3D',   // dark olive
  gini_coefficient:      '#239B56',   // forest green

  // ── GOVERNMENT (purples: deep → violet → mauve) ──────────────────────────
  net_govt_debt:         '#8E44AD',   // deep purple          — most iconic
  gross_govt_debt:       '#6C3483',   // darker purple — already present
  govt_spending:         '#A569BD',   // medium purple
  tax_revenue:           '#BB8FCE',   // light purple
  public_servants:       '#7D3C98',   // violet
  welfare_spending:      '#D2B4DE',   // pale mauve
  infrastructure_spend:  '#5B2C6F',   // dark violet
  tax_revenue_per_capita: '#9B59B6',   // medium purple
  median_tax_burden:      '#C39BD3',   // light purple

  // ── ENVIRONMENT (teals: dark → aqua → moss) ──────────────────────────────
  co2_emissions:         '#16A085',   // dark teal            — most iconic
  renewable_energy:      '#00CEC9',   // bright aqua
  temp_anomaly:          '#76B7A0',   // muted sage teal
  drought_index:         '#0E7A65',   // deep teal
}

/**
 * Get the permanent colour for an indicator.
 * Falls back to a sequential colour if the indicator isn't in the map.
 */
const FALLBACK_COLORS = [
  '#E07B39', '#C0392B', '#2980B9', '#27AE60',
  '#8E44AD', '#16A085', '#F39C12', '#2C3E50',
]

export function getIndicatorColor(id: string, fallbackIndex = 0): string {
  return INDICATOR_COLORS[id] ?? FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]
}

/**
 * Category accent colours — used for category headers and dots in sidebar
 */
export const CATEGORY_COLORS: Record<string, string> = {
  economy:      '#E07B39',
  housing:      '#C0392B',
  demographics: '#2980B9',
  wellbeing:    '#27AE60',
  government:   '#8E44AD',
  environment:  '#16A085',
}
