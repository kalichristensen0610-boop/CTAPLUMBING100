export const site = {
  name: "CTA Plumbing 100",
  shortName: "CTA Plumbing",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ctaplumbing100.com",
  phone: process.env.NEXT_PUBLIC_PHONE || "(208) 795-3366",
  email: process.env.NEXT_PUBLIC_EMAIL || "ctaplumbing100@gmail.com",
  hours: process.env.NEXT_PUBLIC_HOURS || "Monday through Friday, 8:00 AM to 5:00 PM",
  emergencyHours: "24/7 Emergency Plumbing",
  address: {
    street: "8565 E Cash Ln",
    city: "Nampa",
    state: "ID",
    postalCode: "83687",
    country: "US",
  },
  area: "Nampa and the Treasure Valley, Idaho",
  cities: ["Nampa", "Boise", "Meridian", "Caldwell", "Eagle", "Kuna", "Star", "Middleton"],
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.postalCode}`;
export const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
export const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

export const phoneHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;
export const emailHref = `mailto:${site.email}`;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/employment", label: "Employment" },
  { href: "/contact", label: "Contact Us" },
];
