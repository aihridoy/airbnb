import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I book a hotel?",
    a: "Browse or search for a hotel, open its details page, pick your dates and guests, then confirm your reservation and payment.",
  },
  {
    q: "Can I cancel or change my booking?",
    a: "Yes, most bookings can be cancelled free of charge up to 48 hours before check-in from your dashboard's bookings page.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards. Payment is processed securely at the time of booking.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes, all transactions are encrypted and processed following industry-standard security practices.",
  },
  {
    q: "How do I contact a hotel host?",
    a: "Once booked, host details are available on your booking confirmation and dashboard for any questions about your stay.",
  },
];

export default function FAQ() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted">
          Everything you need to know before you book
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group bg-surface border border-hairline rounded-xl px-5 py-4"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-ink">
              {q}
              <ChevronDown
                className="w-5 h-5 text-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="text-sm text-muted mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
