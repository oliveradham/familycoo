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
    reason: "Sender matches household home policy on file.",
    extracted: [
      { label: "Renews", value: "Dec 1" },
      { label: "Change", value: "+6.4% premium" },
    ],
  },
];
