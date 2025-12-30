document.getElementById('wrappedForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('xUsername').value.trim();
    const discordChats = document.getElementById('discordChats').value;
    const magnitude = document.getElementById('magnitude').value;
    const submitBtn = e.target.querySelector('button');

    // Menghilangkan tanda '@' jika user memasukkannya
    const username = usernameInput.replace('@', '');

    // UI Loading
    submitBtn.innerText = "Mencari Data...";
    submitBtn.disabled = true;

    try {
        // Memanggil API yang ada di folder api/
        const response = await fetch(`/api/scraper?username=${username}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Gagal menghubungi server");
        }

        const data = await response.json();

        // Gabungkan data dari form dan hasil scraper
        const wrappedResult = {
            username: username,
            discordCount: discordChats,
            magnitude: magnitude,
            xData: data // Berisi total tweet dan best tweet
        };

        // Simpan ke localStorage agar bisa dibaca di result.html
        localStorage.setItem('wrappedData', JSON.stringify(wrappedResult));

        // Pindah ke halaman hasil
        window.location.href = 'result.html';

    } catch (err) {
        console.error("Error:", err);
        alert("Terjadi Kesalahan: " + err.message);
    } finally {
        submitBtn.innerText = "Generate";
        submitBtn.disabled = false;
    }
});