import { MapPin, Package, Headphones, Globe, ChevronRight } from "lucide-react";

export function AccountScreen({ address, openAddress }) {
  const links = [
    { id: "orders", label: "My orders", icon: Package, hint: "Track and reorder past buys" },
    { id: "support", label: "Customer support", icon: Headphones, hint: "We're here 9am to 11pm" },
    { id: "language", label: "Change language", icon: Globe, hint: "English (India)" },
  ];
  return (
    <main className="account-screen" data-testid="account-screen">
      <div className="screen-header">
        <h1 data-testid="account-title">Account</h1>
        <p>Manage delivery, orders and preferences.</p>
      </div>

      <button type="button" className="account-address" data-testid="account-address" onClick={openAddress}>
        <span className="account-address-icon"><MapPin size={18} /></span>
        <span className="account-address-info">
          <small>Delivery address</small>
          <strong>{address ? address.label : "Add your delivery address"}</strong>
          {address?.line ? <em>{address.line}, {address.city} {address.pincode}</em> : <em>Needed to place your orders.</em>}
        </span>
        <ChevronRight size={18} />
      </button>

      <section className="account-links" data-testid="account-links">
        {links.map(({ id, label, icon: Icon, hint }) => (
          <button type="button" key={id} className="account-link" data-testid={`account-link-${id}`}>
            <span className="account-link-icon"><Icon size={16} /></span>
            <span className="account-link-text">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>

      <p className="account-footnote" data-testid="account-footnote">Come In · Your town, at your door.</p>
    </main>
  );
}
