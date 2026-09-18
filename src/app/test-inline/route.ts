export async function GET() {
  const html = `<!DOCTYPE html><html><head><title>INLINE TEST</title></head><body>
<h2>Inline JS test (no Next.js chunks)</h2>
<p id="st">Effect: NO</p>
<button id="btn" onclick="document.getElementById('btn').textContent='CLICKED - inline works'">CLICK ME inline</button>
<script>
document.title = "INLINE EFFECT OK";
document.getElementById('st').textContent = "Effect: YES";
</script>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
