import { Search, CalendarCheck, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search",
    text: "Browse hotels by category, destination, or dates to find your match.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    text: "Reserve your room in a few clicks with instant confirmation.",
  },
  {
    icon: PartyPopper,
    title: "Stay",
    text: "Check in and enjoy a stay tailored to how you like to travel.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          How It Works
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Three simple steps between you and your next getaway
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="text-center relative">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-brass-dark flex items-center justify-center">
              <Icon className="w-7 h-7 text-cream" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-brass-dark">Step {i + 1}</span>
            <h3 className="font-serif text-xl text-ink mt-1 mb-2">{title}</h3>
            <p className="text-sm text-muted max-w-xs mx-auto">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
