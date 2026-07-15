import { ShieldCheck, RefreshCw, Headset, BadgePercent } from "lucide-react";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    text: "Your transactions are protected with industry-standard encryption.",
  },
  {
    icon: RefreshCw,
    title: "Free Cancellation",
    text: "Plans change - cancel most bookings free up to 48 hours before check-in.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    text: "Our team is here around the clock for any questions or issues.",
  },
  {
    icon: BadgePercent,
    title: "Best Price Guarantee",
    text: "Find a lower price elsewhere? We'll match it, no questions asked.",
  },
];

export default function WhyBookWithUs() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Why Book With Us
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Booking your next stay should feel effortless and secure
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REASONS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="bg-surface rounded-xl border border-hairline p-6 text-center hover:shadow-luxe transition-shadow duration-300"
          >
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center">
              <Icon className="w-6 h-6 text-brass-dark" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
