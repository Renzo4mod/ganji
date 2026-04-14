import { initDb, getDb } from './models/db.js';

const markets = [
  {
    question: "Gor Mahia vs. AFC Leopards: Who wins the next Mashemeji Derby?",
    description: "Predict the outcome of the next Mashemeji Derby between Gor Mahia and AFC Leopards",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "Harambee Stars 2030 WCQ: Will Harambee Stars win their first 2030 World Cup qualifying match?",
    description: "Predict if Kenya's national team will win their first 2030 World Cup Qualifier",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "FKF Premier League: Will a non-Big Four team finish in the Top 3 this season?",
    description: "Predict if a team outside Gor Mahia, AFC Leopards, Bandari, or Sofapaka finishes in top 3",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "Kipchoge's Final Marathon: Will Eliud Kipchoge run a major marathon in 2026?",
    description: "Will Eliud Kipchoge run Boston, NYC, or another major marathon in 2026",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "Magical Kenya Open: Will a Kenyan golfer finish in the Top 10?",
    description: "Predict if a Kenyan golfer will finish in top 10 at the Magical Kenya Open",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "Rugby 7s: Will Kenya finish higher than South Africa in the next Safari 7s?",
    description: "Predict Kenya's performance vs South Africa in the next Safari 7s tournament",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "NBA Africa: Will a Kenyan-born player be drafted into the NBA this year?",
    description: "Predict if any Kenyan-born player gets drafted to the NBA in 2026",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "Volleyball: Will Kenya Pipeline or Prisons win the African Clubs Championship?",
    description: "Predict which Kenyan team wins the next African Clubs Volleyball Championship",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "SportPesa Sponsorship: Will SportPesa announce a new international boxing sponsorship?",
    description: "Predict if SportPesa announces a new international boxing sponsorship deal in 2026",
    category: "sports",
    closes_at: "2026-12-31"
  },
  {
    question: "IEBC Readiness: Will the IEBC be fully constituted by January 2027?",
    description: "Predict if IEBC will have all commissioners in place by January 2027",
    category: "politics",
    closes_at: "2027-01-31"
  },
  {
    question: "Cabinet Reshuffle: Will there be a major cabinet reshuffle in the next 6 months?",
    description: "Predict if President Ruto will make major cabinet changes in next 6 months",
    category: "politics",
    closes_at: "2026-10-31"
  },
  {
    question: "Opposition Unity: Will top 3 opposition leaders sign a pre-election coalition by December?",
    description: "Predict if Raila, Kalonzo, and Moses Wetangula form coalition before December 2026",
    category: "politics",
    closes_at: "2026-12-31"
  },
  {
    question: "Finance Bill: Will the 2026 Finance Bill pass first reading without major amendments?",
    description: "Predict if 2026 Finance Bill passes first reading without significant changes",
    category: "politics",
    closes_at: "2026-12-31"
  },
  {
    question: "Senate Vote: Will the Senate reject any bill from National Assembly this quarter?",
    description: "Predict if Senate rejects at least one bill from National Assembly in Q2 2026",
    category: "politics",
    closes_at: "2026-06-30"
  },
  {
    question: "Governor Defection: Will a sitting governor switch parties before December 2026?",
    description: "Predict if any governor changes political affiliation before end of 2026",
    category: "politics",
    closes_at: "2026-12-31"
  },
  {
    question: "Women Rep Resolution: Will a Women Representative propose a new gender equality motion?",
    description: "Predict if any Women Representative proposes gender equality motion in 2026",
    category: "politics",
    closes_at: "2026-12-31"
  },
  {
    question: "County Budget: Will any county fail to pass its budget by constitutional deadline?",
    description: "Predict if any Kenyan county fails to pass budget by August deadline in 2026",
    category: "politics",
    closes_at: "2026-08-31"
  },
  {
    question: "M-Pesa Global: Will Safaricom launch M-Pesa in a new non-African market in 2026?",
    description: "Predict if Safaricom expands M-Pesa to a new non-African country in 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "Interest Rate Cut: Will CBK lower the CBR before October 2026?",
    description: "Predict if Central Bank of Kenya reduces Central Bank Rate before October 2026",
    category: "business",
    closes_at: "2026-09-30"
  },
  {
    question: "Fuel Prices: Will Super Petrol drop below KSh 150/liter in 2026?",
    description: "Predict if price of Super Petrol falls below KSh 150 anywhere in Kenya in 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "Kenya Shilling vs USD: Will KES strengthen below KSh 120 per USD by December?",
    description: "Predict if Kenyan Shilling appreciates to under 120 KSh per US Dollar by Dec 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "NSE 20 Index: Will the NSE 20 Index close above 5,000 points this quarter?",
    description: "Predict if NSE 20 Share Index closes above 5,000 points in Q2 2026",
    category: "business",
    closes_at: "2026-06-30"
  },
  {
    question: "Startup Acquisition: Will a Kenyan tech startup be acquired for over $50M in 2026?",
    description: "Predict if any Kenyan startup gets acquired for more than $50 million in 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "New Digital Tax: Will a new digital services tax be proposed for social media influencers?",
    description: "Predict if government proposes new tax targeting social media influencers in 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "Inflation Rate: Will Kenya's inflation fall below 5% this year?",
    description: "Predict if Kenya's annual inflation rate drops below 5% in 2026",
    category: "business",
    closes_at: "2026-12-31"
  },
  {
    question: "M-Pesa Downtime: Will M-Pesa have a nationwide outage over 2 hours this month?",
    description: "Predict if M-Pesa experiences nationwide outage exceeding 2 hours in current month",
    category: "business",
    closes_at: "2026-04-30"
  },
  {
    question: "KPLC Blackout: Will there be a nationwide power blackout over 6 hours this quarter?",
    description: "Predict if Kenya experiences nationwide power blackout exceeding 6 hours in Q2 2026",
    category: "business",
    closes_at: "2026-06-30"
  },
  {
    question: "Gen Z Protests: Will there be a major Gen Z-led protest in Nairobi before end of 2026?",
    description: "Predict if Gen Z organizes major protest in Nairobi before December 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "TikTok Ban: Will the government threaten to ban TikTok again in 2026?",
    description: "Predict if Kenyan government issues new threat to ban TikTok in 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Nairobi Fashion Week: Will a politician walk the runway at Nairobi Fashion Week?",
    description: "Predict if any sitting politician appears on runway at Nairobi Fashion Week 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Local Film Award: Will a Kenyan film win Best International Feature at global award?",
    description: "Predict if Kenyan film wins Oscar, BAFTA, or similar Best International Feature in 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Kalenjin Music Chart: Will a new Kalenjin artist trend #1 on YouTube Kenya this month?",
    description: "Predict if new Kalenjin artist's song hits #1 on YouTube Kenya trending this month",
    category: "entertainment",
    closes_at: "2026-04-30"
  },
  {
    question: "Diamond Platnumz Collabo: Will Diamond release a song with a Kenyan artist in 2026?",
    description: "Predict if Diamond Platnumz collaborates with another Kenyan artist in 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Church Attendance: Will a Nairobi mega-church draw over 10,000 this year?",
    description: "Predict if any Nairobi mega-church exceeds 10,000 attendees for single service in 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Reality TV Show: Will a Kenyan reality TV show trend #1 on Twitter Kenya for 24+ hours?",
    description: "Predict if Kenyan reality show trends #1 on Twitter Kenya for full day in 2026",
    category: "entertainment",
    closes_at: "2026-12-31"
  },
  {
    question: "Betting Tax Hike: Will government increase excise duty on betting stakes above 20%?",
    description: "Predict if government raises betting excise tax above current 20% in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "Sports Betting Ban: Will government freeze new betting licenses again?",
    description: "Predict if government imposes temporary freeze on new betting licenses in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "Local Ownership Rule: Will foreign betting firms meet 30% local ownership by deadline?",
    description: "Predict if foreign betting companies achieve 30% local ownership by regulatory deadline",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "SportPesa License: Will SportPesa face license suspension by new authority?",
    description: "Predict if SportPesa faces license suspension by Betting Control and Licensing Board in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "AML Compliance: Will a major betting firm be fined for AML violations this year?",
    description: "Predict if any major betting company gets fined for AML violations in Kenya in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "Gambling Control Act: Will regulations for Gambling Control Act 2025 be fully published?",
    description: "Predict if full regulations for Gambling Control Act 2025 are published in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "Advertising Ban: Will there be a ban on betting ads during live sports broadcasts?",
    description: "Predict if government bans betting advertisements during live sports coverage in 2026",
    category: "regulatory",
    closes_at: "2026-12-31"
  },
  {
    question: "Provably Fair: Will a major crash game crash on first round of the new hour?",
    description: "Predict if crash game crashes at beginning of new hour (xx:00) in next 24 hours",
    category: "niche",
    closes_at: "2026-04-15"
  },
  {
    question: "EAC Federation: Will Kenya host next East African Federation summit before 2027?",
    description: "Predict if Kenya hosts next EAC Federation summit before January 2027",
    category: "geopolitics",
    closes_at: "2026-12-31"
  },
  {
    question: "DRC Peacekeeping: Will Kenya increase troop contribution to DRC mission?",
    description: "Predict if Kenya increases soldiers in MONUSCO peacekeeping mission in 2026",
    category: "geopolitics",
    closes_at: "2026-12-31"
  },
  {
    question: "African Union Chair: Will a Kenyan diplomat hold AUC Chair position by 2027?",
    description: "Predict if Kenyan diplomat becomes African Union Commission Chair by 2027",
    category: "geopolitics",
    closes_at: "2027-01-31"
  }
];

async function seedMarkets() {
  const db = getDb();
  
  const existing = await db.prepare('SELECT COUNT(*) as count FROM markets').get();
  if (existing && existing.count > 0) {
    console.log(`Database already has ${existing.count} markets. Skipping seed.`);
    return;
  }

  const user = await db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
  const creatorId = user?.id || 1;

  if (!creatorId) {
    console.log('No creator found, skipping seed.');
    return;
  }

  for (const market of markets) {
    await db.prepare(`
      INSERT INTO markets (creator_id, question, description, category, fee_percentage, closes_at)
      VALUES (?, ?, ?, ?, 10, ?)
    `).run(creatorId, market.question, market.description, market.category, market.closes_at);
  }

  console.log(`Created ${markets.length} markets successfully!`);
}

export default seedMarkets;