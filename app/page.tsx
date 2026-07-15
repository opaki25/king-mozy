"use client";

import { FormEvent, useEffect, useState } from "react";

const trips = [
  { title: "Murchison Falls", note: "Waterfall · Wildlife · Nile cruise", days: "3–5 days", image: "/assets/1000593130.jpg", tag: "Most loved" },
  { title: "Queen Elizabeth", note: "Big game · Kazinga channel", days: "4–6 days", image: "/assets/1000593107.jpg", tag: "Classic safari" },
  { title: "Sipi Falls", note: "Hikes · Coffee · Mountain air", days: "2–3 days", image: "/assets/1000593134.jpg", tag: "Slow adventure" },
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState("Custom Uganda journey");

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [bookingOpen]);

  function openBooking(trip = "Custom Uganda journey") {
    setSelectedTrip(trip);
    setBookingOpen(true);
    setMenuOpen(false);
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const message = `Hello King Mozy Tours and Travel,\n\nI would like to plan a trip.\n\nName: ${data.get("name")}\nEmail / phone: ${data.get("contact")}\nTrip: ${data.get("trip")}\nTravel month: ${data.get("month")}\nGuests: ${data.get("guests")}\n\nNotes: ${data.get("notes") || "No additional notes"}`;
    if (submitter?.dataset.send === "whatsapp") {
      window.location.href = `https://wa.me/256709599083?text=${encodeURIComponent(message)}`;
      return;
    }
    const subject = encodeURIComponent(`Tour enquiry: ${data.get("trip")}`);
    window.location.href = `mailto:kingmozytoursandtravels@gmail.com?subject=${subject}&body=${encodeURIComponent(message)}`;
  }

  return (
    <main>
      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label="King Mozy Tours and Travel home"><img src="/assets/king-mozy-logo-transparent.png" alt="King Mozy Tours and Travel" /></a>
        <button className="menu-button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#journeys" onClick={() => setMenuOpen(false)}>Journeys</a><a href="#why-us" onClick={() => setMenuOpen(false)}>Why us</a><a href="#about" onClick={() => setMenuOpen(false)}>Our Uganda</a>
        </nav>
        <button className="nav-cta" onClick={() => openBooking()}>Plan my trip <Arrow /></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Uganda, curated by locals</p>
          <h1>Go where<br />Uganda feels<br /><em>untamed.</em></h1>
          <p className="hero-intro">Private safaris, wild escapes and soulful journeys—designed in Kampala, remembered forever.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => openBooking()}>Create my journey <Arrow /></button><a className="text-link" href="#journeys">Explore journeys <span>↓</span></a></div>
          <div className="trust-row"><div className="avatar-stack"><img src="/assets/1000593109.jpg" alt="" /><img src="/assets/1000593115.jpg" alt="" /><img src="/assets/1000593124.jpg" alt="" /></div><p><strong>Made for every kind of traveller</strong><br />Solo · Couples · Families · Groups</p></div>
        </div>
        <div className="hero-collage" aria-label="A collage of unforgettable Uganda experiences">
          <div className="sun-disc" /><div className="photo photo-main"><img src="/assets/1000593111.jpg" alt="Safari travellers crossing Uganda's green landscape" /></div><div className="photo photo-top"><img src="/assets/1000593138.jpg" alt="Mist drifting over Uganda's mountain landscape" /></div><div className="photo photo-bottom"><img src="/assets/1000593104.jpg" alt="A golden sunset over the Nile" /></div>
          <img className="giraffe-cutout" src="/assets/giraffe-family-cutout.png" alt="A family of giraffes" /><div className="stamp"><span>THE PEARL</span><b>UG</b><span>OF AFRICA</span></div><p className="vertical-note">0.3476° N · 32.5825° E</p>
        </div>
      </section>

      <section className="ticker" aria-label="Experiences"><div>GORILLA TREKKING <i>✦</i> NILE ADVENTURES <i>✦</i> WILDLIFE SAFARIS <i>✦</i> CULTURAL ESCAPES <i>✦</i> MOUNTAIN HIKES <i>✦</i> GORILLA TREKKING</div></section>
      <section className="intro" id="about"><div className="section-number">01 / OUR UGANDA</div><div className="intro-copy"><p className="eyebrow dark"><span /> Not just a trip. A story.</p><h2>We know the roads<br />that maps <em>forget.</em></h2></div><p className="intro-note">From the thunder of Murchison Falls to the hush of a gorilla forest, we turn Uganda’s wildest places into journeys that feel deeply personal.</p></section>

      <section className="feature-collage" id="why-us">
        <div className="feature-image big"><img src="/assets/1000593103.jpg" alt="Murchison Falls cutting through a green gorge" /><span>Murchison Falls</span></div><div className="feature-image small"><img src="/assets/1000593133.jpg" alt="A mountain gorilla in the forest" /><span>Bwindi Forest</span></div>
        <div className="feature-card"><span className="card-index">WHY KING MOZY</span><h3>Local eyes.<br />Limitless adventure.</h3><ul><li><b>01</b> Trips shaped around you</li><li><b>02</b> Guides who know every turn</li><li><b>03</b> Thoughtful stays, real moments</li></ul><button onClick={() => openBooking()}>Start planning <Arrow /></button></div>
      </section>

      <section className="journeys" id="journeys">
        <div className="journeys-head"><div><p className="eyebrow light"><span /> Signature escapes</p><h2>Choose your<br /><em>wild.</em></h2></div><p>Start with a favourite, then make it yours. Every itinerary can be slowed down, dialled up or completely reimagined.</p></div>
        <div className="trip-grid">{trips.map((trip, index) => <article className="trip-card" key={trip.title}><img src={trip.image} alt={trip.title} /><div className="trip-shade" /><span className="trip-number">0{index + 1}</span><span className="trip-tag">{trip.tag}</span><div className="trip-info"><p>{trip.days}</p><h3>{trip.title}</h3><small>{trip.note}</small></div><button aria-label={`Enquire about ${trip.title}`} onClick={() => openBooking(trip.title)}><Arrow /></button></article>)}</div>
      </section>

      <section className="quote-section"><div className="quote-photo"><img src="/assets/1000593101.jpg" alt="A winding road through Uganda's highlands" /></div><div className="quote-copy"><span className="quote-mark">“</span><blockquote>Uganda doesn’t ask you to watch from a distance. It invites you all the way in.</blockquote><p>YOUR NEXT STORY STARTS HERE</p></div><div className="quote-photo second"><img src="/assets/1000593122.jpg" alt="Ugandan antelope in an emerald landscape" /></div></section>
      <section className="cta-section"><div className="cta-photo"><img src="/assets/1000593120.jpg" alt="A boat approaching the powerful Murchison Falls" /></div><div className="cta-content"><p className="eyebrow light"><span /> Ready when you are</p><h2>Your Uganda<br />is waiting.</h2><p>Tell us how you want to feel. We’ll handle where, when and every unforgettable detail in between.</p><button className="primary-button gold" onClick={() => openBooking()}>Plan my adventure <Arrow /></button></div></section>

      <footer><div className="footer-main"><img src="/assets/king-mozy-logo-transparent.png" alt="King Mozy Tours and Travel" /><p>Wild Uganda.<br />Beautifully yours.</p><div className="footer-contact"><a className="icon-link" href="mailto:kingmozytoursandtravels@gmail.com"><img src="/assets/email-icon.jpg" alt="" /><span>kingmozytoursandtravels@gmail.com</span></a><a className="icon-link" href="tel:+256709599083"><img src="/assets/call-icon.jpg" alt="" /><span>Call +256 709 599 083</span></a><a className="icon-link" href="https://wa.me/256709599083?text=Hello%20King%20Mozy%20Tours%20and%20Travel%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer"><img src="/assets/whatsapp-icon.jpg" alt="" /><span>WhatsApp +256 709 599 083</span></a><a className="icon-link" href="https://www.google.com/maps/search/?api=1&query=Plot+249+Ggaba+Road+Kansanga+Kampala+Uganda" target="_blank" rel="noreferrer"><img src="/assets/maps-icon.jpg" alt="" /><span>Plot 249 Ggaba Road<br />Kansanga, Kampala, Uganda</span></a></div><div className="socials"><a href="https://www.instagram.com/kingmozytoursandtravel" target="_blank" rel="noreferrer">Instagram <Arrow /></a><a href="https://www.tiktok.com/@kingmozy0" target="_blank" rel="noreferrer">TikTok <Arrow /></a></div></div><div className="footer-base"><span>© {new Date().getFullYear()} King Mozy Tours and Travel</span><span>Website by <strong>ZHEAD LABS</strong></span></div></footer>

      {bookingOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setBookingOpen(false); }}><div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" onClick={() => setBookingOpen(false)} aria-label="Close booking form">×</button><div className="modal-heading"><p className="eyebrow dark"><span /> Your adventure starts here</p><h2 id="booking-title">Let’s plan your<br /><em>Uganda.</em></h2><p>Share the basics, then choose Email or WhatsApp to send everything directly to our team.</p></div><form onSubmit={submitBooking}><label>Your name<input name="name" required placeholder="e.g. Amina K." /></label><label>Email or phone<input name="contact" required placeholder="How should we reach you?" /></label><label>Journey<select name="trip" value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)}><option>Custom Uganda journey</option>{trips.map(t => <option key={t.title}>{t.title}</option>)}</select></label><div className="form-row"><label>Travel month<input name="month" type="month" required /></label><label>Guests<input name="guests" type="number" min="1" defaultValue="2" required /></label></div><label>What would make this trip special?<textarea name="notes" rows={3} placeholder="Wildlife, pace, celebrations, must-sees…" /></label><div className="form-submit-actions"><button className="primary-button" type="submit" data-send="email">Send by email <Arrow /></button><button className="primary-button whatsapp-button" type="submit" data-send="whatsapp">Send by WhatsApp <Arrow /></button></div></form></div></div>}
    </main>
  );
}
