// Seeded mock data for the Family COO demo profile (Thompson household).
export type Person = {
  id: string;
  name: string;
  role: "parent" | "child" | "nanny" | "grandparent";
  initials: string;
  detail: string;
  color: string;
};

export const family: Person[] = [
  { id: "aimee", name: "Aimee Thompson", role: "parent", initials: "A", detail: "You", color: "bg-zinc-900 text-white" },
  { id: "basil", name: "Basil Thompson", role: "parent", initials: "B", detail: "Partner", color: "bg-zinc-800 text-white" },
  { id: "oliver", name: "Oliver", role: "child", initials: "O", detail: "Age 9 · Grade 4", color: "bg-stone-200 text-zinc-900" },
  { id: "lily", name: "Lily", role: "child", initials: "L", detail: "Age 5 · Preschool", color: "bg-stone-100 text-zinc-900" },
  { id: "nanny", name: "Sofia (Nanny)", role: "nanny", initials: "S", detail: "M–F · 2–7 PM", color: "bg-amber-50 text-zinc-900" },
];

export type Confidence = "high" | "medium" | "low";
export type BriefingItem = {
  id: string;
  priority: "high" | "medium" | "low";
  text: string;
  action?: string;
  confidence: Confidence;
  why: string;
};

export const briefing: BriefingItem[] = [
  {
    id: "b1",
    priority: "high",
    text: "Oliver's tennis starts at 4:30 PM. Traffic is heavier than usual — leaving by 3:55 PM keeps you calm.",
    action: "Notify Basil",
    confidence: "high",
    why: "Weather feed shows rain from 5 PM. Maps history for this route runs 12 minutes slower on Mondays after 4 PM.",
  },
  {
    id: "b2",
    priority: "high",
    text: "Lily's tuition ($2,400) is scheduled for Friday. I have it ready to send — you just need to confirm.",
    action: "Approve payment",
    confidence: "high",
    why: "Saint Jude's bursar email · matches last quarter's invoice · your usual card on file.",
  },
  {
    id: "b3",
    priority: "medium",
    text: "You have a free hour this afternoon. Lily's dentist visit is still open — I can hold 2:15 PM.",
    action: "Hold 2:15 PM",
    confidence: "medium",
    why: "Willowdale Dental has openings. Your calendar is clear 2–3 PM. Lily is due for a 6-month cleaning.",
  },
  {
    id: "b4",
    priority: "medium",
    text: "Your grocery pattern suggests milk and fruit will run out mid-week. I can add both to Thursday's order.",
    action: "Add to Thursday",
    confidence: "medium",
    why: "H-E-B reorder rhythm is every 8 days. Last delivery was 6 days ago. Milk and blueberries appear in 9 of the last 10 orders.",
  },
  {
    id: "b5",
    priority: "high",
    text: "Start your passport renewal this month so it's in hand before Tokyo in November.",
    action: "Begin renewal",
    confidence: "high",
    why: "Passport on file expires within 6 months of ANA flight on Oct 24 — Japan requires 6+ months validity.",
  },
];

export type CalendarEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  who: string[];
  category: "school" | "sports" | "work" | "medical" | "family" | "travel";
  priority?: boolean;
};

export const today: CalendarEvent[] = [
  { id: "e1", time: "07:30", title: "Breakfast + lunches packed", detail: "Sofia arriving 7:45", who: ["aimee"], category: "family" },
  { id: "e2", time: "08:30", title: "School drop-off", detail: "Lily & Oliver · Basil driving", who: ["basil", "oliver", "lily"], category: "school" },
  { id: "e3", time: "12:00", title: "Board meeting", detail: "High priority · Confirmed", who: ["aimee"], category: "work", priority: true },
  { id: "e4", time: "15:30", title: "Lily pickup", detail: "Sofia (Nanny)", who: ["nanny", "lily"], category: "school" },
  { id: "e5", time: "16:30", title: "Oliver — Tennis practice", detail: "Riverside Club · Weather advisory", who: ["oliver", "basil"], category: "sports", priority: true },
  { id: "e6", time: "19:00", title: "Family dinner", detail: "Roast chicken · Basil cooking", who: ["aimee", "basil", "oliver", "lily"], category: "family" },
];

export const upcoming: { day: string; date: string; events: CalendarEvent[] }[] = [
  {
    day: "Tuesday",
    date: "Oct 15",
    events: [
      { id: "t1", time: "09:00", title: "Lily — Pediatrician", detail: "Dr. Chen · Annual wellness", who: ["lily", "aimee"], category: "medical" },
      { id: "t2", time: "18:00", title: "Oliver — Homework club", detail: "Math sheets due Wed", who: ["oliver"], category: "school" },
    ],
  },
  {
    day: "Wednesday",
    date: "Oct 16",
    events: [
      { id: "w1", time: "10:00", title: "Aimee — Dentist", detail: "Cleaning · 45 min", who: ["aimee"], category: "medical" },
    ],
  },
  {
    day: "Friday",
    date: "Oct 18",
    events: [
      { id: "f1", time: "08:00", title: "Tuition due — Saint Jude's", detail: "$2,400 · Auto-pay ready", who: ["aimee"], category: "school", priority: true },
      { id: "f2", time: "17:00", title: "Oliver — Tennis tournament check-in", detail: "Hotel Marlowe · 2 nights", who: ["oliver", "basil"], category: "sports" },
    ],
  },
];

export type Task = {
  id: string;
  title: string;
  detail: string;
  assignee: string;
  category: string;
  done: boolean;
};

export const tasks: Task[] = [
  { id: "tk1", title: "Confirm hotel for tennis tournament", detail: "Hotel Marlowe · Fri–Sun", assignee: "basil", category: "Sports", done: false },
  { id: "tk2", title: "Sign Lily's field trip permission slip", detail: "Zoo · due Thursday", assignee: "aimee", category: "School", done: false },
  { id: "tk3", title: "Order oat milk, eggs, blueberries", detail: "Weekly grocery run", assignee: "nanny", category: "Groceries", done: false },
  { id: "tk4", title: "Replace HVAC filter", detail: "Due in 12 days · Bedroom unit", assignee: "basil", category: "Home", done: false },
  { id: "tk5", title: "Book Lily's dentist", detail: "6-month cleaning", assignee: "aimee", category: "Medical", done: false },
  { id: "tk6", title: "Renew car registration", detail: "Expires Nov 3", assignee: "basil", category: "Home", done: true },
];

export const schoolEmails = [
  {
    id: "s1",
    from: "Saint Jude's Elementary",
    subject: "Fall spirit week + tuition reminder",
    summary: "Spirit week Oct 21–25 (color-coded days below). Q2 tuition auto-draft on Friday Oct 18. Book fair Oct 23, bring $10–20.",
    actions: ["Add spirit week to calendar", "Confirm tuition draft", "Send $15 for book fair"],
    time: "9:12 AM",
  },
  {
    id: "s2",
    from: "Ms. Patel (Oliver's teacher)",
    subject: "Multiplication tables + Wednesday quiz",
    summary: "Oliver should review tables 6–9 tonight. Quiz Wednesday. Ms. Patel suggests 15 minutes of flashcards.",
    actions: ["Schedule 15 min flashcards tonight", "Reply thank you"],
    time: "Yesterday",
  },
  {
    id: "s3",
    from: "Preschool PTA",
    subject: "Zoo field trip permission",
    summary: "Zoo trip Thursday Oct 17. Slip + $22 due Wednesday. Pack lunch, sunscreen, no peanuts.",
    actions: ["Sign slip", "Pack peanut-free lunch"],
    time: "2 days ago",
  },
];

export const sports = [
  {
    id: "sp1",
    child: "Oliver",
    sport: "Tennis",
    next: "Practice · Today 4:30 PM",
    weather: "Rain from 5:00 PM — leave 15 min early",
    ranking: "Club U10 · #4",
    upcoming: "Fall Classic tournament · Fri–Sun",
    equipment: "New grip tape needed",
  },
  {
    id: "sp2",
    child: "Lily",
    sport: "Ballet",
    next: "Class · Saturday 10:00 AM",
    weather: "Clear",
    ranking: "—",
    upcoming: "Winter recital · Dec 14",
    equipment: "Tights (size 5) — ordered",
  },
];

export const trips = [
  {
    id: "tr1",
    name: "Tokyo family trip",
    dates: "Oct 24 – Nov 3",
    status: "Passport expires in 6 months — renew now",
    countdown: "10 days out",
    items: ["Flights: ANA 007 · confirmed", "Hotel: Aman Tokyo · confirmed", "Rail passes: pending", "Packing list: 62% ready"],
  },
  {
    id: "tr2",
    name: "Fall Classic tournament (Oliver)",
    dates: "Oct 18 – Oct 20",
    status: "Hotel confirmed · rental car pending",
    countdown: "3 days out",
    items: ["Hotel Marlowe · confirmed", "Rental car: reserving Enterprise", "Racquet + 2 backup strings", "Snack + hydration kit"],
  },
];

export const pantry = {
  low: [
    { item: "Whole milk", detail: "Ran out this morning" },
    { item: "Eggs", detail: "2 left" },
    { item: "Blueberries", detail: "Oliver's breakfast" },
    { item: "Sourdough", detail: "Basil bakes Sunday" },
  ],
  suggestions: [
    "Roast chicken tonight — need thyme + lemon",
    "Lily's school snacks (peanut-free)",
    "Trip snacks for Fall Classic weekend",
  ],
};

export const maintenance = [
  { id: "m1", item: "HVAC filter — bedroom unit", due: "12 days", status: "on track" },
  { id: "m2", item: "Smoke detector batteries", due: "Next month", status: "on track" },
  { id: "m3", item: "Car registration (Basil)", due: "Nov 3", status: "on track" },
  { id: "m4", item: "Pool service", due: "Winterize by Nov 15", status: "attention" },
  { id: "m5", item: "Home insurance renewal", due: "Dec 1", status: "on track" },
];

export const medical = [
  { id: "md1", who: "Oliver", detail: "Flu shot — due this month", status: "attention" },
  { id: "md2", who: "Lily", detail: "Pediatrician wellness · Tue 9 AM", status: "scheduled" },
  { id: "md3", who: "Aimee", detail: "Dentist · Wed 10 AM", status: "scheduled" },
  { id: "md4", who: "Lily", detail: "Allergies: peanuts (severe), pollen", status: "reference" },
  { id: "md5", who: "Basil", detail: "Rx refill — Atorvastatin, 8 days left", status: "attention" },
];

export const documents = [
  { id: "d1", name: "Aimee — Passport", detail: "Expires Apr 12, 2027 · Renew now for Japan", tag: "Travel" },
  { id: "d2", name: "Oliver — Birth certificate", detail: "Scanned · verified", tag: "Vital" },
  { id: "d3", name: "Lily — Immunization record", detail: "Updated Aug 2025", tag: "Medical" },
  { id: "d4", name: "Home insurance policy", detail: "Renews Dec 1 · Chubb", tag: "Home" },
  { id: "d5", name: "Saint Jude's tuition contract", detail: "2025–2026 · $9,600/yr", tag: "School" },
  { id: "d6", name: "2024 tax return", detail: "Filed Apr 2025", tag: "Finance" },
];

export const expenses = [
  { category: "Childcare", amount: 3240, delta: "+12%", note: "Nanny hours trending high" },
  { category: "Groceries", amount: 1180, delta: "−4%", note: "On budget" },
  { category: "Sports", amount: 640, delta: "+8%", note: "Tournament weekend" },
  { category: "Medical", amount: 220, delta: "−22%", note: "Down vs. last month" },
  { category: "Education", amount: 2400, delta: "0%", note: "Tuition due Friday" },
  { category: "Travel", amount: 1860, delta: "+34%", note: "Japan deposits" },
];

export const memory = [
  { label: "Oliver — Shoe size", value: "US 3Y (growing fast)" },
  { label: "Lily — Favorite meal", value: "Pasta with peas · no cheese" },
  { label: "Basil — Airline", value: "ANA Star Alliance Gold" },
  { label: "Aimee — Hotel loyalty", value: "Aman Circle" },
  { label: "Household — Dietary", value: "Lily: peanut allergy · Basil: low-cholesterol" },
  { label: "Preferred pharmacy", value: "Willowdale on Elm" },
];

// ---------- Zero-setup intelligence (detected from email + calendar) ----------

export const detectedProfile = [
  {
    id: "oliver",
    name: "Oliver",
    detail: "Awty International School · Grade 4",
    tags: ["Tennis · Riverside Club", "Piano · Ms. Alvarez", "Pediatrician: Dr. Chen"],
    confidence: 0.94,
  },
  {
    id: "lily",
    name: "Lily",
    detail: "Saint Jude's Preschool",
    tags: ["Gymnastics · Little Stars", "Ballet · Saturdays", "Peanut allergy noted"],
    confidence: 0.91,
  },
  {
    id: "basil",
    name: "Basil",
    detail: "Partner · ANA Star Alliance Gold detected",
    tags: ["Frequent traveler", "Cardio Rx refills"],
    confidence: 0.88,
  },
];

export const detectedActions = [
  {
    id: "a1",
    title: "Complete Oliver's annual medical form",
    due: "Due Aug 10",
    source: "Awty School Nurse · 3 emails",
    confidence: 0.96,
    kind: "task" as const,
  },
  {
    id: "a2",
    title: "Pay Lily's tuition",
    due: "Due Friday",
    source: "Saint Jude's Bursar",
    confidence: 0.99,
    kind: "task" as const,
  },
  {
    id: "a3",
    title: "Register Oliver for tennis Fall Classic",
    due: "Closes Jul 22",
    source: "Coach Marco · Riverside Club",
    confidence: 0.93,
    kind: "task" as const,
  },
  {
    id: "a4",
    title: "Renew Aimee's passport before Tokyo trip",
    due: "Trip Oct 24",
    source: "ANA booking + passport record",
    confidence: 0.87,
    kind: "task" as const,
  },
  {
    id: "a5",
    title: "Volunteer request — book fair",
    due: "Optional",
    source: "Saint Jude's PTA",
    confidence: 0.42,
    kind: "maybe" as const,
  },
  {
    id: "a6",
    title: "Weekly school newsletter",
    due: "—",
    source: "Awty Communications",
    confidence: 0.15,
    kind: "info" as const,
  },
];

export type InboxLane =
  | "Needs Signature"
  | "Needs Payment"
  | "Needs Response"
  | "Needs Scheduling"
  | "Waiting on Others"
  | "Upcoming Travel"
  | "Renewals"
  | "Low Priority";

export type InboxItem = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  assigned: string;
  confidence: number;
  category: "School" | "Sports" | "Medical" | "Travel" | "Grocery" | "Finance" | "Home";
  lane: InboxLane;
  reason: string;
  extracted?: { label: string; value: string }[];
};

export const inbox: InboxItem[] = [
  {
    id: "i1",
    from: "Coach Marco · Riverside Club",
    subject: "Fall Classic — final roster & check-in",
    preview: "Please confirm Oliver's entry by Jul 22. Check-in Fri 5 PM at Hotel Marlowe.",
    time: "8:04 AM",
    assigned: "oliver",
    confidence: 0.97,
    category: "Sports",
    lane: "Needs Response",
    reason: "Sender is Oliver's tennis coach. Tournament on his calendar. 12 prior emails classified to Oliver.",
    extracted: [
      { label: "Deadline", value: "Jul 22" },
      { label: "Event", value: "Fall Classic · Oct 18–20" },
      { label: "Location", value: "Hotel Marlowe" },
    ],
  },
  {
    id: "i2",
    from: "Awty School Nurse",
    subject: "Annual medical form — physician signature required",
    preview: "Attached: 2025 health packet. Return by Aug 10 with physician's signature.",
    time: "Yesterday",
    assigned: "oliver",
    confidence: 0.99,
    category: "Medical",
    lane: "Needs Signature",
    reason: "School matches Oliver's grade record. Attachment filename contains 'Oliver_Thompson_2025.pdf'.",
    extracted: [
      { label: "Deadline", value: "Aug 10" },
      { label: "Requires", value: "MD signature · Upload to portal" },
      { label: "Attachment", value: "Oliver_Thompson_2025.pdf" },
    ],
  },
  {
    id: "i3",
    from: "ANA All Nippon Airways",
    subject: "Booking confirmation · HND ⇄ IAH",
    preview: "Thompson family × 4 · Depart Oct 24 · Return Nov 3. Confirmation 7XKQR2.",
    time: "2d ago",
    assigned: "aimee",
    confidence: 0.98,
    category: "Travel",
    lane: "Upcoming Travel",
    reason: "Airline confirmation. 4 travelers match household. Grouped with Aman Tokyo hotel + JR pass emails into one trip.",
    extracted: [
      { label: "Confirmation", value: "7XKQR2" },
      { label: "Dates", value: "Oct 24 → Nov 3" },
      { label: "Passport check", value: "Aimee expires within 6 months" },
    ],
  },
  {
    id: "i4",
    from: "Instacart · H-E-B",
    subject: "Your order was delivered",
    preview: "12 items delivered. Whole milk, eggs, blueberries, sourdough, avocados…",
    time: "3d ago",
    assigned: "aimee",
    confidence: 0.94,
    category: "Grocery",
    lane: "Low Priority",
    reason: "Recurring receipt from H-E-B. Household reorders milk every ~8 days.",
    extracted: [
      { label: "Total", value: "$146.20" },
      { label: "Reorder likely", value: "Milk · Blueberries" },
    ],
  },
  {
    id: "i5",
    from: "Ms. Patel (Grade 4)",
    subject: "Multiplication quiz Wednesday",
    preview: "Please have Oliver review tables 6–9. 15 min flashcards should be enough.",
    time: "3d ago",
    assigned: "oliver",
    confidence: 0.72,
    category: "School",
    lane: "Needs Scheduling",
    reason: "Teacher of Oliver's classroom. Content references Grade 4 curriculum. Not fully certain — needs confirm.",
    extracted: [{ label: "Deadline", value: "Wednesday quiz" }],
  },
  {
    id: "i6",
    from: "Chubb Insurance",
    subject: "Home policy renewal notice",
    preview: "Auto-renews Dec 1. Premium increased 6.4%.",
    time: "4d ago",
    assigned: "basil",
    confidence: 0.9,
    category: "Home",
    lane: "Renewals",
    reason: "Sender matches household home policy on file.",
    extracted: [
      { label: "Renews", value: "Dec 1" },
      { label: "Change", value: "+6.4% premium" },
    ],
  },
  {
    id: "i7",
    from: "Saint Jude's Bursar",
    subject: "Q2 tuition invoice · $2,400",
    preview: "Auto-draft scheduled Friday Oct 18. Confirm or change card on file.",
    time: "5d ago",
    assigned: "aimee",
    confidence: 0.99,
    category: "Finance",
    lane: "Needs Payment",
    reason: "Recurring bursar invoice matches your quarterly tuition rhythm. Card ending 4412 on file.",
    extracted: [
      { label: "Amount", value: "$2,400" },
      { label: "Draft date", value: "Fri Oct 18" },
    ],
  },
  {
    id: "i8",
    from: "Basil",
    subject: "Re: Enterprise rental for tournament",
    preview: "Still waiting on Basil to confirm the rental car pickup time.",
    time: "1d ago",
    assigned: "basil",
    confidence: 0.85,
    category: "Travel",
    lane: "Waiting on Others",
    reason: "You asked Basil to book the rental 2 days ago. No confirmation email received yet.",
    extracted: [
      { label: "Waiting since", value: "Wed 9:30 AM" },
      { label: "Needed by", value: "Fri Oct 18" },
    ],
  },
];

// ---------- Weekly Family Review ----------

export const weeklyReview = {
  headline: "A calm week. Two items still open.",
  wins: [
    "Oliver's medical form submitted — 3 days ahead of deadline.",
    "Grocery spend down 4% versus last month.",
    "Lily's ballet tuition paid without a reminder.",
  ],
  upcoming: [
    { label: "Tuition · Saint Jude's", when: "Friday", amount: "$2,400" },
    { label: "Tennis Fall Classic", when: "Fri–Sun", amount: "Travel + entry $340" },
    { label: "HVAC filter change", when: "Next Tuesday", amount: "—" },
  ],
  attention: [
    "Passport renewal — 18 weeks until Tokyo. Still worth starting this month.",
    "Basil's Rx refill — 8 days of supply left.",
  ],
  trends: [
    { label: "Childcare spend", value: "+12%", note: "Nanny picked up 3 extra evenings for board prep." },
    { label: "Sports spend", value: "+8%", note: "Tournament travel." },
    { label: "Medical spend", value: "−22%", note: "Lower than last month." },
  ],
  prompt: "What would you like me to help organize next week?",
};

// ---------- Family Command Center ----------

export const commandCenter = {
  today: [
    { id: "c1", text: "Lily pickup changed to 4:15 PM.", owner: "nanny", tag: "School" },
    { id: "c2", text: "Oliver needs his tennis uniform.", owner: "basil", tag: "Sports" },
    { id: "c3", text: "Medical form due in two days.", owner: "aimee", tag: "Medical" },
    { id: "c4", text: "Grocery delivery arrives 2:00–4:00 PM.", owner: "aimee", tag: "Groceries" },
  ],
  coming: [
    { id: "n1", text: "Board meeting · 12:00 PM", when: "in 2h" },
    { id: "n2", text: "Lily pickup · 4:15 PM", when: "in 6h" },
    { id: "n3", text: "Oliver tennis · 4:30 PM", when: "in 6h" },
  ],
  atRisk: [
    { id: "r1", text: "No one is assigned to take Oliver to tennis.", cta: "Assign" },
    { id: "r2", text: "Passport renewal — 18 weeks and untouched.", cta: "Start" },
    { id: "r3", text: "Pediatrician has not returned Oliver's medical form (6 days).", cta: "Draft follow-up" },
  ],
  handled: [
    { id: "h1", text: "Added the school holiday to the calendar." },
    { id: "h2", text: "Saved the Aman Tokyo confirmation to the vault." },
    { id: "h3", text: "Added milk, eggs, blueberries to Thursday's order." },
    { id: "h4", text: "Reminded Sofia about the earlier pickup." },
  ],
  approvals: [
    { id: "ap1", text: "Send $2,400 tuition Friday from card •• 4412.", cta: "Approve" },
    { id: "ap2", text: "Book Enterprise rental car for tournament weekend.", cta: "Approve" },
  ],
};

// ---------- Who Is Doing What ----------

export const responsibilities = [
  { id: "rp1", task: "Lily pickup", when: "Today 4:15 PM", owner: "nanny", status: "assigned" as const },
  { id: "rp2", task: "Oliver → tennis practice", when: "Today 4:30 PM", owner: null, status: "unassigned" as const },
  { id: "rp3", task: "Sign Lily's field trip slip", when: "By Wednesday", owner: "aimee", status: "assigned" as const },
  { id: "rp4", task: "Buy gift for Mia's party", when: "Sat 2 PM party", owner: null, status: "unassigned" as const },
  { id: "rp5", task: "Meet HVAC technician", when: "Thu 10 AM", owner: "basil", status: "assigned" as const },
  { id: "rp6", task: "Pack Oliver's school bag", when: "Tonight", owner: "oliver", status: "assigned" as const },
  { id: "rp7", task: "Follow up with Dr. Chen (medical form)", when: "Sent 6 days ago", owner: "aimee", status: "waiting" as const },
];

// ---------- Autopilot ----------

export const autopilotRules = [
  { id: "ap-1", title: "Notify nanny when pickup times change", detail: "Sofia gets a text with the new time and reason.", enabled: true },
  { id: "ap-2", title: "Add school holidays to the calendar", detail: "From Awty + Saint Jude's calendars.", enabled: true },
  { id: "ap-3", title: "Create packing lists before recurring activities", detail: "Tennis, ballet, school trips.", enabled: true },
  { id: "ap-4", title: "Add registration deadlines as tasks", detail: "Sports, camps, school programs.", enabled: true },
  { id: "ap-5", title: "Notify the responsible adult when travel time changes", detail: "Traffic + weather adjustments.", enabled: false },
  { id: "ap-6", title: "Suggest recurring grocery items", detail: "Based on 90-day reorder rhythm.", enabled: true },
  { id: "ap-7", title: "Remind family to charge devices before travel", detail: "24 hours before departure.", enabled: false },
  { id: "ap-8", title: "Prepare tournament & appointment checklists", detail: "Adapts to weather and event length.", enabled: true },
];

export const autopilotLog = [
  { id: "al1", when: "8:04 AM", text: "Texted Sofia that Lily's pickup moved to 4:15 PM.", reversible: true },
  { id: "al2", when: "Yesterday", text: "Added 'No school — teacher planning' to Oct 24.", reversible: true },
  { id: "al3", when: "Yesterday", text: "Added milk & blueberries to Thursday's H-E-B order.", reversible: true },
  { id: "al4", when: "2d ago", text: "Created 'Fall Classic checklist' for Oliver.", reversible: true },
];

// ---------- Handoff ----------

export const handoffs = [
  {
    id: "hf1",
    child: "Lily",
    from: "aimee",
    to: "nanny",
    when: "Today",
    items: [
      "Pickup: 4:15 PM (moved earlier)",
      "Gymnastics: 5:00 PM",
      "Bring pink leotard (in the blue bag)",
      "Snack is packed — apple + crackers",
      "Medicine given at 1:00 PM (Zyrtec)",
      "Home by 6:30 PM",
    ],
  },
  {
    id: "hf2",
    child: "Oliver",
    from: "aimee",
    to: "basil",
    when: "Today",
    items: [
      "Tennis: 4:30 PM at Riverside",
      "New grip tape in racquet bag",
      "Rain forecast from 5 PM — extra towel packed",
      "Homework: multiplication tables 6–9 in the car",
      "Snack: banana + peanut-free bar",
    ],
  },
];

// ---------- Checklists ----------

export const checklists = [
  {
    id: "cl1",
    title: "Oliver — Tennis bag",
    activity: "Tennis · Riverside Club",
    context: "Outdoor · Forecast 91°F · 2 hr session",
    items: [
      { label: "Racquet + backup strings", learned: true },
      { label: "2 water bottles", learned: false, reason: "Heat above 90°F" },
      { label: "Hat", learned: true },
      { label: "Sunscreen SPF 50", learned: false, reason: "Outdoor + midday" },
      { label: "Tennis shoes", learned: true },
      { label: "Wristbands", learned: true },
      { label: "Peanut-free snack", learned: true },
    ],
  },
  {
    id: "cl2",
    title: "Lily — Ballet bag",
    activity: "Ballet · Saturdays 10 AM",
    context: "Indoor studio",
    items: [
      { label: "Leotard (pink)", learned: true },
      { label: "Tights size 5", learned: true },
      { label: "Ballet slippers", learned: true },
      { label: "Water bottle", learned: true },
      { label: "Hair pins + bun net", learned: true },
    ],
  },
  {
    id: "cl3",
    title: "Family — Air travel",
    activity: "Tokyo trip · Oct 24",
    context: "International · 4 travelers · 14 hr flight",
    items: [
      { label: "Passports (valid > 6 months)", learned: false, reason: "Japan entry rule" },
      { label: "JR rail passes (printed)", learned: true },
      { label: "Kids' iPads charged", learned: true },
      { label: "Prescription medications", learned: true },
      { label: "Travel adapter (Type A)", learned: true },
      { label: "Snacks + refillable bottles", learned: true },
    ],
  },
];

// ---------- Departure Intelligence ----------

export const departures = [
  {
    id: "dep1",
    event: "Oliver's tennis · 4:30 PM",
    getReadyAt: "3:25 PM",
    leaveAt: "3:50 PM",
    reasons: [
      "18 min drive at this hour (Mondays 12 min slower)",
      "5 min parking + walk to court",
      "Oliver takes ~15 min to change and warm up",
    ],
  },
  {
    id: "dep2",
    event: "ANA 007 · Oct 24, 10:15 AM",
    getReadyAt: "4:40 AM",
    leaveAt: "5:40 AM",
    reasons: [
      "40 min drive to IAH at that hour",
      "20 min parking + shuttle",
      "International check-in closes 60 min before",
      "TSA average 22 min, walk to gate 12 min",
      "Family buffer for the kids: +20 min",
    ],
  },
];

// ---------- Conflicts ----------

export const conflicts = [
  {
    id: "cf1",
    title: "Two pickups at once",
    detail: "Aimee is scheduled for Lily (4:15 PM) and Oliver (4:30 PM). Locations are 22 min apart.",
    proposal: "Have Basil take Oliver — he finishes work at 4:00 today.",
  },
  {
    id: "cf2",
    title: "Tournament vs. birthday party",
    detail: "Oliver's Fall Classic and Mia's party both fall on Saturday afternoon.",
    proposal: "Basil takes Oliver to the tournament. Aimee takes Lily to Mia's party.",
  },
  {
    id: "cf3",
    title: "Medical form vs. doctor's schedule",
    detail: "Awty form is due Aug 10 but requires an in-person visit — Dr. Chen's next opening is Aug 8.",
    proposal: "Hold the 3:15 PM Aug 8 slot with Dr. Chen.",
  },
  {
    id: "cf4",
    title: "Passport won't have 6 months validity",
    detail: "Aimee's passport is valid, but not 6+ months past the Tokyo return.",
    proposal: "Start expedited renewal this week — 4 week turnaround.",
  },
  {
    id: "cf5",
    title: "Flight arrives after hotel check-in cutoff",
    detail: "ANA 007 lands 8:40 PM; Aman Tokyo standard check-in closes 8 PM.",
    proposal: "Notify hotel of late arrival — I have a template ready.",
  },
];

// ---------- Waiting on Others ----------

export const waitingOn = [
  { id: "w1", person: "Dr. Chen (Pediatrician)", task: "Sign Oliver's medical form", sent: "6 days ago", suggest: "Draft polite follow-up" },
  { id: "w2", person: "Coach Marco", task: "Confirm Oliver's tournament roster spot", sent: "3 days ago", suggest: "Text a nudge" },
  { id: "w3", person: "Basil", task: "Confirm Enterprise rental pickup time", sent: "2 days ago", suggest: "Ask tonight at dinner" },
  { id: "w4", person: "Chubb Insurance", task: "Refund on cancelled add-on", sent: "9 days ago", suggest: "Call — email is stalling" },
  { id: "w5", person: "Awty School", task: "Response on carpool group", sent: "4 days ago", suggest: "Follow up Monday" },
];

// ---------- Decisions ----------

export const decisions = [
  {
    id: "dc1",
    question: "Which summer camp fits the family calendar?",
    options: [
      { label: "Camp Redwood — Wk 3", tradeoff: "Aligns with Basil's PTO. Oliver's friend Marcus enrolled. $340 higher." },
      { label: "Riverside Tennis Camp — Wk 5", tradeoff: "Overlaps with Aimee's board offsite. Great tennis fit for Oliver." },
    ],
    recommendation: "Camp Redwood, Week 3 — logistics fit and Oliver's peer group.",
  },
  {
    id: "dc2",
    question: "Which flight to Tokyo is best for the kids?",
    options: [
      { label: "ANA 9:00 AM", tradeoff: "$120 more. Lily wakes at 6 AM. Arrives before hotel check-in." },
      { label: "ANA 5:15 AM", tradeoff: "Cheaper. Lily wakes at 3 AM. High meltdown risk." },
    ],
    recommendation: "Take the 9:00 AM — the $120 saves a rough day.",
  },
  {
    id: "dc3",
    question: "Should we drop an activity this season?",
    options: [
      { label: "Keep piano, drop swim", tradeoff: "Frees 2 hrs/week. Oliver prefers piano lately." },
      { label: "Keep swim, drop piano", tradeoff: "Physical variety. But recital is Dec 14 — sunk cost." },
    ],
    recommendation: "Keep piano through the December recital, revisit in January.",
  },
];

// ---------- Purchase Memory ----------

export const purchases = [
  { id: "pm1", label: "Oliver — Shoes", value: "US 3Y (up from 2.5Y in June)", note: "Growing fast — size up next order." },
  { id: "pm2", label: "Lily — Clothing", value: "5T (up from 4T)", note: "Recent 4T returns confirm the size change." },
  { id: "pm3", label: "Sunscreen", value: "Blue Lizard Sensitive SPF 50", note: "Lily's dermatologist-approved." },
  { id: "pm4", label: "School uniform", value: "Lands' End — Saint Jude's plaid", note: "Reorder polos every August." },
  { id: "pm5", label: "Racquet strings", value: "Wilson NXT Power 16g", note: "Coach Marco's recommendation." },
  { id: "pm6", label: "Basil — Rx", value: "Atorvastatin 20mg · Willowdale", note: "90-day refill." },
  { id: "pm7", label: "Disliked", value: "Neutrogena kids sunscreen", note: "Lily reacts — do not reorder." },
];

// ---------- Returns / Refunds ----------

export const returns = [
  { id: "rt1", item: "Oliver's tennis shoes (wrong size)", retailer: "Tennis Warehouse", deadline: "4 days", status: "Return" },
  { id: "rt2", item: "Lily's 4T dresses", retailer: "Amazon", deadline: "9 days", status: "Return" },
  { id: "rt3", item: "Camping stove", retailer: "REI", deadline: "12 days", status: "Keep" },
  { id: "rt4", item: "Chubb refund — cancelled add-on", retailer: "Chubb", deadline: "Waiting", status: "Waiting for refund" },
];

// ---------- Gifts ----------

export const gifts = [
  {
    id: "gf1",
    event: "Mia's 6th birthday",
    when: "Sat Oct 19 · 2 PM",
    for: "Mia (Lily's classmate)",
    ideas: ["Craft kit — Lily loved hers", "Picture book set", "Small dollhouse figures"],
    pastGifts: ["Sticker book (last year)"],
    status: "Not purchased",
  },
  {
    id: "gf2",
    event: "Grandma's birthday",
    when: "Nov 12",
    for: "Aimee's mom",
    ideas: ["Framed print from Tokyo trip", "Loose-leaf tea set", "Hand-written letter from grandkids"],
    pastGifts: ["Cashmere scarf (2024)", "Photo book (2023)"],
    status: "Idea saved",
  },
  {
    id: "gf3",
    event: "Thank-you note owed",
    when: "Sent after Oliver's birthday",
    for: "Uncle Ravi",
    ideas: ["Handwritten card from Oliver"],
    pastGifts: ["Bike helmet (gift received)"],
    status: "Pending",
  },
];

// ---------- Health Preparation ----------

export const healthPrep = [
  {
    id: "hp1",
    who: "Lily",
    appointment: "Pediatrician · Tue Oct 15, 10:30 AM",
    bring: ["Insurance card (Aetna)", "Vaccination record (updated Aug 2025)", "School health form"],
    ask: ["Recurring rash on left arm", "Sleep — night waking 2×/wk", "Peanut allergy — retest schedule"],
    forms: ["Awty preschool physician signature"],
  },
  {
    id: "hp2",
    who: "Basil",
    appointment: "Rx refill · Atorvastatin",
    bring: ["Willowdale pharmacy card"],
    ask: ["90-day supply for Japan trip"],
    forms: [],
  },
];

// ---------- Emergency ----------

export const emergency = {
  contacts: [
    { label: "Pediatrician", value: "Dr. Chen · Willowdale Peds · (713) 555-0142" },
    { label: "Preferred hospital", value: "Texas Children's Hospital" },
    { label: "Aimee (Mom)", value: "(713) 555-0110" },
    { label: "Basil (Dad)", value: "(713) 555-0111" },
    { label: "Grandma (backup)", value: "(281) 555-0199" },
  ],
  allergies: [
    { who: "Lily", detail: "Peanuts (severe) · EpiPen in blue bag & school nurse's office" },
    { who: "Oliver", detail: "Mild seasonal pollen" },
  ],
  medications: [
    { who: "Lily", detail: "Zyrtec 5ml · morning during allergy season" },
    { who: "Basil", detail: "Atorvastatin 20mg · nightly" },
  ],
  insurance: "Aetna PPO · Group 44821 · Member 918-22-4471",
  authorizedPickup: ["Aimee", "Basil", "Sofia (Nanny)", "Grandma Ravi"],
  schools: [
    { label: "Awty (Oliver)", value: "(713) 555-2200 · Front office" },
    { label: "Saint Jude's (Lily)", value: "(713) 555-3040 · Ms. Alvarez" },
  ],
};

// ---------- Travel Readiness ----------

export const readiness = {
  trip: "Tokyo — Oct 24 → Nov 3",
  score: 76,
  done: [
    "Flights: ANA 007 confirmed",
    "Hotel: Aman Tokyo confirmed",
    "Travel insurance active",
    "Kids' school absence notices filed",
    "Luggage tags printed",
  ],
  todo: [
    { label: "Confirm airport transportation", weight: 8 },
    { label: "Renew Aimee's passport (< 6 months)", weight: 12, critical: true },
    { label: "Pack prescription medications", weight: 6 },
    { label: "Notify school (Oliver)", weight: 4 },
    { label: "Reserve first-night dinner", weight: 3 },
    { label: "Print JR rail passes", weight: 5 },
  ],
};

// ---------- Scenarios ----------

export const scenarios = [
  {
    id: "sc1",
    q: "What happens if Sofia is unavailable tomorrow?",
    a: "Lily's 3:15 PM pickup and Oliver's homework help both need coverage. Grandma is 25 min away and free after 2 PM. I can text her.",
  },
  {
    id: "sc2",
    q: "Can we fit a weekend trip this month?",
    a: "Oct 25–27 is the calmest window. No kids' events, weather is mild, and driving 3 hours puts you in Fredericksburg. Everything else conflicts with tennis or the Tokyo prep.",
  },
  {
    id: "sc3",
    q: "What would need to change if Oliver adds a second tennis lesson?",
    a: "Thursdays 5 PM works. It pushes dinner to 7 PM (Basil can cook). It bumps Oliver's homework — shift math to Wednesdays.",
  },
  {
    id: "sc4",
    q: "Can we afford Camp Redwood this summer?",
    a: "Yes. Current trajectory leaves a $1,120 buffer after Tokyo. I'd move it out of the travel budget bucket into education.",
  },
];

// ---------- Capture ----------

export const captured = [
  {
    id: "cp1",
    kind: "Screenshot",
    from: "iMessage · Coach Marco",
    interpretation: "Tennis practice tonight moved to 5:00 PM (was 4:30).",
    proposal: "Update calendar, notify Basil, adjust departure to 4:20 PM.",
  },
  {
    id: "cp2",
    kind: "Photo",
    from: "Paper invitation",
    interpretation: "Mia's 6th birthday · Sat Oct 19, 2 PM · 1420 Willow Lane.",
    proposal: "Add to Lily's calendar, add gift reminder for Thursday.",
  },
  {
    id: "cp3",
    kind: "PDF",
    from: "Camp Redwood brochure",
    interpretation: "Session dates Jul 7–11 and Jul 14–18. Registration opens Feb 3.",
    proposal: "Save to Vault, add 'Register — Feb 3' task.",
  },
];

// ---------- Family Search ----------

export const searchExamples = [
  { q: "Where is Oliver's passport?", a: "In the small drawer, upstairs office. Last scanned Apr 2025 · Vault → Vital." },
  { q: "What did the school say about uniforms?", a: "Lands' End resumes fulfillment Aug 5 (email · Awty · Jun 18). Polos need to be reordered before school starts." },
  { q: "When did Lily last see the dentist?", a: "Mar 14 · Dr. Rivera · Willowdale Dental. Next cleaning due now." },
  { q: "How much have we spent on tennis this year?", a: "$3,140 across coaching, tournaments, and equipment. Trending +8% vs last year." },
  { q: "Which hotel in Tokyo last time?", a: "Park Hyatt Tokyo · Nov 2022 · 4 nights. Aimee flagged 'loved the pool for kids'." },
];

// ---------- Family History ----------

export const history = [
  { id: "hs1", when: "Aug 2025", label: "Oliver's first tournament win", tag: "Milestone" },
  { id: "hs2", when: "Jun 2025", label: "Family trip · Big Bend", tag: "Trip" },
  { id: "hs3", when: "May 2025", label: "Lily's first ballet recital", tag: "Milestone" },
  { id: "hs4", when: "Mar 2025", label: "New house — moved in", tag: "Milestone" },
  { id: "hs5", when: "Dec 2024", label: "Family holiday · Aspen", tag: "Trip" },
  { id: "hs6", when: "Nov 2024", label: "Oliver's 9th birthday", tag: "Birthday" },
];

export const annualSummary = {
  year: 2025,
  moments: 34,
  trips: 5,
  milestones: 8,
  highlights: [
    "Oliver won his first U10 tournament (Aug).",
    "Lily started preschool at Saint Jude's (Sep).",
    "Family moved to the new house (Mar).",
    "First family trip to Japan — booked (Oct).",
  ],
};

// ---------- Calm Mode ----------

export const calm = {
  now: [
    { id: "cm1", text: "Sign Lily's field trip slip.", when: "5 minutes" },
    { id: "cm2", text: "Leave for Oliver's tennis at 3:50 PM.", when: "Later today" },
  ],
  laterTonight: ["Approve tuition draft", "Reply to Coach Marco"],
  tomorrow: ["Lily's pediatrician appt · 10:30 AM", "Passport renewal — start"],
  everythingElseNote: "I'm holding 14 other items. None are urgent today.",
};
