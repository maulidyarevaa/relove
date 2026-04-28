const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const content = document.querySelector(".content");
const navItems = document.querySelectorAll(".nav-item");
let desktopCollapsed = false;

function setSidebarState(collapsed) {
  sidebar.classList.toggle("collapsed", collapsed);
  content.classList.toggle("sidebar-open", !collapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
}

sidebarToggle.addEventListener("click", () => {
  const isCollapsed = sidebar.classList.contains("collapsed");
  const nextCollapsed = !isCollapsed;

  if (window.innerWidth > 768) {
    desktopCollapsed = nextCollapsed;
  }

  setSidebarState(nextCollapsed);
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((link) => link.classList.remove("is-active"));
    item.classList.add("is-active");

    // Auto collapse after navigation on smaller screens.
    if (window.innerWidth <= 768) {
      setSidebarState(true);
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    setSidebarState(true);
    return;
  }

  setSidebarState(desktopCollapsed);
});

// Default state: expanded on desktop, collapsed on mobile.
setSidebarState(window.innerWidth <= 768);
