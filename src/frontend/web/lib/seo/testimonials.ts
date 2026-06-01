/** Early customer feedback shown on the homepage (not Google Business Profile reviews). */
export const CUSTOMER_TESTIMONIALS = [
  {
    quote:
      "I wanted someone dependable without the back-and-forth every few weeks. Having visits booked in advance makes life much easier.",
    name: "Sarah M.",
    area: "Leeds",
  },
  {
    quote:
      "Being able to see who's coming and reschedule online is a big deal for us. It feels properly organised, not like a favour from a mate.",
    name: "James & Priya",
    area: "York",
  },
] as const;

export type CustomerTestimonial = (typeof CUSTOMER_TESTIMONIALS)[number];
