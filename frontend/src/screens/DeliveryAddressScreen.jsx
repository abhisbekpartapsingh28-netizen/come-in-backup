import { useState } from "react";
import { ChevronLeft, MapPin, Home, Briefcase } from "lucide-react";

const labelOptions = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: MapPin },
];

export function DeliveryAddressScreen({ address, saveAddress, onBack }) {
  const [labelType, setLabelType] = useState(address?.labelType || "home");
  const [fullName, setFullName] = useState(address?.fullName || "");
  const [phone, setPhone] = useState(address?.phone || "");
  const [line, setLine] = useState(address?.line || "");
  const [city, setCity] = useState(address?.city || "");
  const [pincode, setPincode] = useState(address?.pincode || "");
  const [instructions, setInstructions] = useState(address?.instructions || "");
  const [savedToast, setSavedToast] = useState(false);

  const canSave = fullName.trim() && phone.trim().length >= 10 && line.trim() && city.trim() && pincode.trim().length === 6;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSave) return;
    const chosen = labelOptions.find((item) => item.id === labelType);
    saveAddress({
      labelType,
      label: chosen?.label || "Address",
      fullName: fullName.trim(),
      phone: phone.trim(),
      line: line.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      instructions: instructions.trim(),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1600);
  }

  return (
    <main className="address-screen" data-testid="address-screen">
      <button type="button" className="back-button" data-testid="address-back" onClick={onBack}><ChevronLeft size={16} /> Back</button>
      <div className="screen-header">
        <h1 data-testid="address-title">Delivery address</h1>
        <p>Tell us where to deliver your Come In order.</p>
      </div>

      <form className="address-form" onSubmit={handleSubmit} data-testid="address-form">
        <fieldset className="label-row">
          <legend>Save as</legend>
          <div className="label-options">
            {labelOptions.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                data-testid={`address-label-${id}`}
                className={labelType === id ? "label-chip active" : "label-chip"}
                onClick={() => setLabelType(id)}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label>Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" data-testid="address-full-name" />
        </label>
        <label>Phone number
          <input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" data-testid="address-phone" inputMode="numeric" />
        </label>
        <label>Address line
          <input value={line} onChange={(event) => setLine(event.target.value)} placeholder="House no., building, street" data-testid="address-line" />
        </label>
        <div className="address-row-two">
          <label>City
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" data-testid="address-city" />
          </label>
          <label>Pincode
            <input value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit" data-testid="address-pincode" inputMode="numeric" />
          </label>
        </div>
        <label>Delivery instructions (optional)
          <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={2} placeholder="Ring the bell twice, keep at the door…" data-testid="address-instructions" />
        </label>

        <button type="submit" className="primary-button" disabled={!canSave} data-testid="address-save">
          Save delivery address
        </button>
        {savedToast && <p className="toast-note" data-testid="address-saved-toast">Address saved to this device.</p>}
      </form>
    </main>
  );
}
