document.getElementById("wrappedForm").onsubmit = e => {
  e.preventDefault();

  const username = xUsername.value.trim().replace("@", "");
  const discordChats = discordChats.value;
  const magnitude = magnitude.value;

  sessionStorage.setItem("wrappedInput", JSON.stringify({
    username,
    discordChats,
    magnitude
  }));

  location.href = "result.html";
};
