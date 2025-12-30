const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: false });

downloadBtn.onclick = async () => {
  const area = document.getElementById("recordArea");
  const stream = area.captureStream(24);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.start();

  // total durasi scene ±9 detik
  setTimeout(async () => {
    recorder.stop();
  }, 9000);

  recorder.onstop = async () => {
    const webmBlob = new Blob(chunks, { type: "video/webm" });

    try {
      await ffmpeg.load();
      ffmpeg.FS("writeFile", "in.webm", await fetchFile(webmBlob));
      await ffmpeg.run(
        "-i", "in.webm",
        "-pix_fmt", "yuv420p",
        "-movflags", "faststart",
        "out.mp4"
      );

      const mp4 = ffmpeg.FS("readFile", "out.mp4");
      download(mp4.buffer, "seismic-wrapped.mp4", "video/mp4");

    } catch {
      // fallback WebM
      download(webmBlob, "seismic-wrapped.webm", "video/webm");
    }
  };
};

function download(data, name, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}
