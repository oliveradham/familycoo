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

export type BriefingItem = {
  id: string;
  priority: "high" | "medium" | "low";
  text: string;
  action?: string;
};

export const briefing: BriefingItem[] = [
  { id: "b1", priority: "high", text: "Oliver has tennis at 4:30 PM. Rain starts at 5:00 PM — leave 15 minutes early.", action: "Notify Basil" },
  { id: "b2", priority: "high", text: "Lily's tuition for Saint Jude's is due Friday ($2,400).", action: "Schedule payment" },
  { id: "b3", priority: "medium", text: "Nanny hours are 12% above this week's budget.", action: "Review timesheet" },
  { id: "b4", priority: "medium", text: "Groceries: you're out of milk, eggs, and fruit.", action: "Add to list" },
  { id: "b5", priority: "high", text: "Your passport expires in 6 months — Japan trip in October needs renewal.", action: "Start renewal" },
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
