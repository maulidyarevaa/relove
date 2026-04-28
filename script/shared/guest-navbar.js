const navbarMount = document.getElementById("navbarMount");

function setupGuestNavbar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const guestSidebar = document.getElementById("guestSidebar");
  const guestShell = document.querySelector(".guest-shell");

  if (!sidebarToggle || !guestSidebar || !guestShell) {
    return;
  }

  function openSidebar() {
    guestSidebar.classList.remove("is-collapsed");
    guestShell.classList.add("sidebar-open");
  }

  function closeSidebar() {
    guestSidebar.classList.add("is-collapsed");
    guestShell.classList.remove("sidebar-open");
  }

  function toggleSidebar() {
    if (guestSidebar.classList.contains("is-collapsed")) {
      openSidebar();
      return;
    }

    closeSidebar();
  }

  sidebarToggle.addEventListener("click", toggleSidebar);

  document.querySelectorAll(".sidebar-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !guestSidebar.classList.contains("is-collapsed")) {
      closeSidebar();
    }
  });

  if (window.innerWidth <= 900) {
    closeSidebar();
  }
}

if (navbarMount) {
  fetch("navBar.html")
    .then((response) => response.text())
    .then((markup) => {
      navbarMount.innerHTML = markup;
      setupGuestNavbar();
    });
}
