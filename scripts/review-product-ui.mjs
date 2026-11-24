/** Run after npm run build: node scripts/review-product-ui.mjs /absolute/output-directory */
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const out = process.argv[2];
if (!out || !path.isAbsolute(out))
  throw new Error("Pass an absolute output directory outside the repository.");
if (path.relative(root, out).split(path.sep)[0] !== "..")
  throw new Error("Keep review output outside the application repository.");
fs.mkdirSync(out, { recursive: true });
const built = fs.readFileSync(
  path.join(root, ".next/server/app/index.html"),
  "utf8",
);
const styles = [...built.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
  .map((match) => match[0])
  .join("");
const bodyClass = built.match(/<body class="([^"]*)"/)?.[1] || "";
await build({
  entryPoints: [path.join(root, "scripts/fixtures/product-review.tsx")],
  outfile: path.join(out, "review.js"),
  bundle: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  minify: true,
  define: {
    "process.env": "{}",
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME": '""',
    "process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET": '""',
  },
  plugins: [
    {
      name: "review-adapters",
      setup(builder) {
        builder.onResolve({ filter: /^next\/(image|link)$/ }, (args) => ({
          path: args.path,
          namespace: "review-adapter",
        }));
        builder.onResolve({ filter: /(?:^|\/)hooks\/useAuth$/ }, () => ({
          path: "auth",
          namespace: "review-adapter",
        }));
        builder.onResolve({ filter: /^@react-oauth\/google$/ }, () => ({
          path: "google",
          namespace: "review-adapter",
        }));
        builder.onResolve({ filter: /(?:^|\/)lib\/api$/ }, () => ({
          path: "api",
          namespace: "review-adapter",
        }));
        builder.onResolve(
          { filter: /\/node_modules\/react\/index\.js$/ },
          (args) => ({ path: args.path, namespace: "file" }),
        );
        builder.onLoad(
          { filter: /.*/, namespace: "review-adapter" },
          (args) => {
            const react = JSON.stringify(
              path.join(root, "node_modules/react/index.js"),
            );
            const prelude = `import React from ${react};`;
            if (args.path === "api")
              return {
                contents: `const blocked=async()=>{throw Error('API disabled in review fixture')};export const checkInGuest=blocked;export const lookupGuestByCode=blocked;`,
                loader: "js",
              };
            if (args.path === "auth")
              return {
                contents: `export const useAuth=()=>({currentUser:{id:'review-only',fullName:'Rian Aditama',email:'contoh@example.com',packageId:'free',activeSlug:'rian-salsa'},updateProfile:async()=>{throw Error('Review only')}});`,
                loader: "js",
              };
            if (args.path === "google")
              return {
                contents:
                  prelude +
                  `export const GoogleLogin=()=>React.createElement('button',{type:'button',disabled:true},'Google · hanya pratinjau');`,
                loader: "js",
              };
            return {
              contents:
                prelude +
                (args.path === "next/link"
                  ? `export default function Link({children,prefetch,...props}){return React.createElement('a',props,children)}`
                  : `export default function Image({fill,priority,sizes,...props}){return React.createElement('img',{...props,style:fill?{position:'absolute',inset:0,width:'100%',height:'100%',...props.style}:props.style})}`),
              loader: "js",
            };
          },
        );
      },
    },
  ],
});
fs.cpSync(path.join(root, ".next/static"), path.join(out, "_next/static"), {
  recursive: true,
});
fs.cpSync(
  path.join(root, "public/assets/themes/shots"),
  path.join(out, "assets/themes/shots"),
  { recursive: true },
);
// Actual product URLs are rooted at /assets; expose the same public images in this review site.
fs.cpSync(
  path.join(root, "public/assets/themes/shots"),
  path.join(out, "../assets/themes/shots"),
  { recursive: true },
);
fs.cpSync(
  path.join(root, "public/assets/video-sample"),
  path.join(out, "../assets/video-sample"),
  { recursive: true },
);
for (const name of fs.readdirSync(path.join(root, "public")))
  if (/^logo.*\.(png|svg|webp)$/.test(name)) {
    fs.copyFileSync(path.join(root, "public", name), path.join(out, name));
    fs.copyFileSync(
      path.join(root, "public", name),
      path.join(out, "..", name),
    );
  }
const frameHtml = `<!doctype html><html lang="id"><head><meta name="viewport" content="width=device-width, initial-scale=1">${styles.replaceAll('href="/', 'href="./')}</head><body class="${bodyClass}"><div id="root"></div><script src="review.js"></script></body></html>`;
fs.writeFileSync(path.join(out, "frame.html"), frameHtml);
fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html><html lang="id"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Review UI RuangHadir</title><style>body{margin:0;background:#e9eee6;color:#233c35;font:13px system-ui}header{padding:16px 22px;background:white;border-bottom:1px solid #ccd8c9}label{display:inline-block;margin:8px 16px 8px 0}select{padding:8px;font-size:16px}main{padding:20px;overflow:auto}iframe{border:1px solid #c8d5c5;background:white;display:block;margin:auto;height:1000px;max-width:none}a{color:#176b5b}p{font-size:12px}</style><header><a href="../#home">← Ruang riset</a><h1 style="font-size:20px">Review komponen UI aplikasi</h1><p>Komponen dari branch review, data contoh di memori. Ini bukan aplikasi produksi. API, unggahan dan OAuth dinonaktifkan; preview undangan tidak diganti.</p><label>Bagian <select id="screen"><option value="overview">Ringkasan</option><option value="landing">Landing page</option><option value="auth">Autentikasi</option><option value="design">Editor</option><option value="guests">Daftar tamu</option><option value="analytics">Analitik</option><option value="profile">Profil</option><option value="upgrade">Paket</option><option value="settings">Katalog tema</option></select></label><label>Lebar <select id="width"><option>1280</option><option>1440</option><option>430</option><option>390</option><option>360</option></select> px</label></header><main><iframe id="frame" title="Review komponen RuangHadir" style="width:1280px"></iframe></main><script>const frame=document.querySelector('#frame');const frameHtml=${JSON.stringify(frameHtml).replaceAll("<", "\\u003c")};const render=()=>{frame.srcdoc=frameHtml.replace('<html ', '<html data-screen="'+document.querySelector('#screen').value+'" ')};render();document.querySelector('#screen').onchange=render;document.querySelector('#width').onchange=e=>{frame.style.width=e.target.value+'px'};</script></html>`,
);
console.log(
  `UI review fixture built at ${out}; adapters are only used by this fixture.`,
);
