document.documentElement.classList.add("insights-workspace");
if (new URLSearchParams(location.search).get("embed") === "1") {
  document.documentElement.classList.add("embedded");
}
