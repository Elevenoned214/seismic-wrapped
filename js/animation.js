const raw = sessionStorage.getItem("wrappedInput");
if (!raw) {
  alert("Generate first");
  location.href = "index.html";
}
const data = JSON.parse(raw);

userUsername.innerText = "@" + data.username;

function show(id) {
  document.querySelectorAll(".scene").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function counter(id, val) {
  let n = 0;
  const el = document.getElementById(id);
  const step = Math.max(val / 30, 1);
  const i = setInterval(() => {
    n += step;
    el.innerText = Math.floor(n);
    if (n >= val) {
      el.innerText = val;
      clearInterval(i);
    }
  }, 16);
}

(async () => {
  show("scene1");
  counter("discordCount", data.discordChats);

  const res = await fetch(`/api/scrape?username=${data.username}`);
  const result = await res.json();

  counter("tweetCount", result.total);
  await new Promise(r => setTimeout(r, 3000));

  show("scene2");
  tweetContent.innerText = result.tweet.text;
  counter("likesCount", result.tweet.likes);
  counter("retweetsCount", result.tweet.rts);
  counter("repliesCount", result.tweet.replies);
  await new Promise(r => setTimeout(r, 3000));

  show("scene3");
  magnitudeBadge.src = `assets/badges/magnitude-${data.magnitude}.png`;
})();
