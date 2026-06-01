import { CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY } from "@/lib/consumer-plans";

export type FaqItem = { q: string; a: string };

export const HOME_FAQS: FaqItem[] = [
  {
    q: "What's included in garden care?",
    a: "10 visits per year, about every 5–6 weeks: lawn mowing and edging, weeding, general tidy, and light watering on each visit. You need a working outdoor tap; we bring hose or watering can. You dispose of clippings or leave your garden-waste bin out. Manage everything in your online account.",
  },
  {
    q: "How does garden size affect price?",
    a: "We price by the lawn and beds we maintain, not your whole plot, plus how often you want visits and any add-ons you choose. Use Get your quote to see your personalised monthly price before you pay. Above 150 m² maintained we quote separately.",
  },
  {
    q: "What add-ons can I choose?",
    a: "At signup you can add hedge trim 4× per year, seasonal tidy and leaf clearance 4× per year, or patio and path refresh 2× per year. Add-ons require a 6-month minimum term on monthly billing.",
  },
  {
    q: "What do I need to prepare before a visit?",
    a: `${CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY} See our terms for the full list.`,
  },
  {
    q: "Can I hire my gardener directly?",
    a: "Your subscription covers visits arranged through GardensSorted. While you're subscribed, and for 12 months after your last platform visit, you agree not to hire gardeners we introduced to you for the same work off-platform without our consent - that protects scheduling and fair pay. Other local gardeners you've never booked through us are fine.",
  },
  {
    q: "What's not included?",
    a: "Major clearance, tree surgery, tall hedge reduction, and landscaping. We don't make separate trips just for watering, patio cleaning, leaf blowing, or gutter clearing - but we can quote those as seasonal add-ons.",
  },
  {
    q: "Do you water the garden?",
    a: "Yes - light watering of pots, beds, and dry spots while we're on site. You need a working outdoor tap; we bring hose or watering can. We don't make extra trips just to water between visits.",
  },
  {
    q: "Can you clean the patio, blow leaves, or clear gutters?",
    a: "On regular visits we'll lightly sweep garden-adjacent paving and do light leaf work in the maintained area when we're there. Thorough patio cleaning, dedicated seasonal leaf clearance, and gutter clearing are optional add-ons at signup.",
  },
  {
    q: "Which areas do you cover?",
    a: "We're launching across Yorkshire, starting with Leeds, York, Wakefield, and surrounding postcodes. Enter yours at signup - we'll confirm availability.",
  },
  {
    q: "How does billing work?",
    a: "You subscribe online with a clear monthly price for your garden size and any add-ons you chose. Subscriptions include a minimum term (typically 3 months on garden care). After your minimum term, get in touch if you need to make changes.",
  },
  {
    q: "Can I reschedule a visit?",
    a: "Yes. Log in to your account to reschedule or cancel a visit before your gardener is on the way.",
  },
  {
    q: "How do I get help?",
    a: "Use the chat on our website or message us through your customer account. We're happy to answer questions before and after you sign up.",
  },
];
