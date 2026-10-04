const companies = [
  { name: "Google", slug: "google" },
  { name: "Meta", slug: "meta" },
  { name: "Amazon", slug: "amazon" },
  { name: "Netflix", slug: "netflix" },
  { name: "Apple", slug: "apple" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Flipkart", slug: "flipkart" },
  { name: "Swiggy", slug: "swiggy" },
  { name: "Zomato", slug: "zomato" },
  { name: "Zerodha", slug: "zerodha" },
  { name: "CRED", slug: "cred" },
  { name: "PhonePe", slug: "phonepe" },
  { name: "Razorpay", slug: "razorpay" },
  { name: "Ola", slug: "ola" },
  { name: "Paytm", slug: "paytm" },
  { name: "Infosys", slug: "infosys" },
  { name: "Wipro", slug: "wipro" },
  { name: "MakeMyTrip", slug: "makemytrip" },
];

const LogoChip = ({ name, slug }) => (
  <div className="flex shrink-0 items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-6 py-4">
    <img
      src={`https://cdn.simpleicons.org/${slug}/white`}
      alt={`${name} logo`}
      loading="lazy"
      className="h-6 w-6 object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
    <span className="whitespace-nowrap font-display text-base font-bold text-zinc-200">
      {name}
    </span>
  </div>
);

const MarqueeRow = ({ items, reverse = false }) => (
  <div className="marquee-paused flex overflow-hidden">
    <div
      className={`flex w-max gap-5 pr-5 ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
    >
      {[...items, ...items].map((c, i) => (
        <LogoChip key={`${c.slug}-${i}`} name={c.name} slug={c.slug} />
      ))}
    </div>
  </div>
);

const CompanyMarquee = () => (
  <div className="relative space-y-5">
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />
    <MarqueeRow items={companies.slice(0, 9)} />
    <MarqueeRow items={companies.slice(9)} reverse />
  </div>
);

export default CompanyMarquee;
