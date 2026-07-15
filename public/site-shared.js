const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuButton.textContent = open ? "Close" : "Menu";
    menuButton.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.textContent = "Menu";
    menuButton.setAttribute("aria-expanded", "false");
  }));
}

document.querySelectorAll(".current-year").forEach(element => {
  element.textContent = new Date().getFullYear();
});

const contactForm = document.getElementById("booking-form");
if (contactForm) {
  const tripSelect = document.getElementById("contactTrip");
  const requestedTrip = new URLSearchParams(location.search).get("trip");
  if (requestedTrip && tripSelect) tripSelect.value = requestedTrip;

  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const value = name => String(data.get(name) || "Not specified");
    const message =
`Hello King Mozy Tours and Travel,

I would like to plan a Uganda journey.

Name: ${value("name")}
Email / phone: ${value("contact")}
Travelling from: ${value("country")}
Journey: ${value("trip")}
Travel month: ${value("month")}
Guests: ${value("guests")}
Duration: ${value("duration")}
Stay style: ${value("stay")}

Notes: ${value("notes")}`;
    const method = event.submitter?.dataset.send || "email";
    if (method === "whatsapp") {
      location.href = `https://wa.me/256709599083?text=${encodeURIComponent(message)}`;
      return;
    }
    const subject = encodeURIComponent(`Tour booking request: ${value("trip")}`);
    location.href = `mailto:kingmozytoursandtravels@gmail.com?subject=${subject}&body=${encodeURIComponent(message)}`;
  });
}
