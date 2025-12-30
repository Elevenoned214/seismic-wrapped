document.getElementById('wrappedForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Mencegah halaman reload saat form dikirim

  const username = document.getElementById('xUsername').value;
  const discordChats = document.getElementById('discordChats').value;
  const magnitude = document.getElementById('magnitude').value;

  // Tampilkan loading (opsional, ganti teks tombol misalnya)
  const submitBtn = e.target.querySelector('button');
  submitBtn.innerText = "Processing...";
  submitBtn.disabled = true;

  try {
    // 1. Panggil API Scraper yang ada di folder api/
    const response = await fetch(`/api/scraper?username=${username}`);
    const data = await response.json();

    if (data.error) {
      alert("Gagal mengambil data: " + data.error);
      submitBtn.innerText = "Generate";
      submitBtn.disabled = false;
      return;
    }

    // 2. Simpan semua data ke localStorage agar bisa dibaca di result.html
    const finalData = {
      username: username,
      discordChats: discordChats,
      magnitude: magnitude,
      xData: data // Berisi 'total' dan 'tweet' dari scraper.js
    };
    
    localStorage.setItem('wrappedData', JSON.stringify(finalData));

    // 3. Pindah ke halaman hasil
    window.location.href = 'result.html';

  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan koneksi.");
    submitBtn.innerText = "Generate";
    submitBtn.disabled = false;
  }
});