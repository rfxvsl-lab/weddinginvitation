const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find and replace the old theme grid section
const oldSection = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-slideUp" style={{ animationDelay: '100ms' }}>
                {DEFAULT_THEMES.map((theme) => {
                  const isRecommended = theme.id === 'rfx-dark' || theme.id === 'spotilove';
                  return (
                    <div
                      key={theme.id}
                      onClick={() => {
                        wedding.setThemeId(theme.id);
                        setIsSelectingTheme(false);
                      }}
                      className={\`card-interactive p-0 flex flex-col justify-between h-[300px] transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-1 \${isRecommended
                        ? 'border-primary ring-2 ring-[var(--color-primary-light)]'
                        : ''
                        }\`}
                    >
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                        style={{
                          backgroundColor: theme.bgHex,
                          backgroundImage: \`radial-gradient(\${theme.primaryHex} 1.5px, transparent 0)\`,
                          backgroundSize: '24px 24px',
                        }}
                      />

                      <div className="relative z-10 p-7 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-display font-bold text-2xl text-[var(--color-on-surface)] tracking-tight uppercase">
                              {theme.name}
                            </h3>
                            <span className="inline-block text-[10px] font-mono text-[var(--color-outline)] uppercase tracking-widest mt-1">
                              {theme.pattern} design
                            </span>
                          </div>
                          {isRecommended && (
                            <span className="bg-primary text-on-surface text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Pilihan
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[var(--color-on-surface-variant)] mt-4 leading-relaxed font-body-serif">
                          Estetika visual dengan kombinasi font {theme.fontSerif === 'font-serif' ? 'Cormorant / Lora' : 'Great Vibes / Inter'} serta palet warna lembut {theme.primaryHex}.
                        </p>
                      </div>

                      <div className="relative z-10 p-5 border-t border-[var(--color-outline-variant)] flex justify-between items-center bg-surface-container-low backdrop-blur-md">
                        <div className="flex gap-2">
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.primaryHex }} title="Warna Utama" />
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bgHex }} title="Warna Latar" />
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.textHex }} title="Warna Teks" />
                        </div>
                        <button className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider cursor-pointer">
                          PILIH TEMA <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>`;

const newSection = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-slideUp" style={{ animationDelay: '100ms' }}>
                {DEFAULT_THEMES.map((theme) => {
                  const isRecommended = theme.id === 'rfx-dark' || theme.id === 'spotilove';
                  return (
                    <div
                      key={theme.id}
                      className={\`card-interactive p-0 flex flex-col justify-between h-[320px] transition-all duration-300 relative overflow-hidden group border \${
                        isRecommended
                          ? 'border-primary ring-2 ring-[var(--color-primary-light)]'
                          : 'border-outline-variant hover:border-primary/50'
                      }\`}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.15] pointer-events-none group-hover:scale-105 group-hover:opacity-[0.25] transition-all duration-700 ease-out"
                        style={{
                          backgroundColor: theme.bgHex,
                          backgroundImage: \`radial-gradient(\${theme.primaryHex} 1.5px, transparent 0)\`,
                          backgroundSize: '24px 24px',
                        }}
                      />

                      <div className="relative z-10 p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-display font-bold text-xl text-[var(--color-on-surface)] tracking-tight uppercase leading-tight mb-1">
                              {theme.name}
                            </h3>
                            <span className="inline-block text-[10px] font-mono text-[var(--color-outline)] uppercase tracking-widest">
                              {theme.pattern} design
                            </span>
                          </div>
                          {isRecommended && (
                            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex-shrink-0">
                              PRO
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.primaryHex }} title="Warna Utama" />
                          <span className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bgHex }} title="Warna Latar" />
                          <span className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.textHex }} title="Warna Teks" />
                        </div>

                        <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-auto leading-relaxed font-body-serif line-clamp-2">
                          Estetika visual dengan kombinasi font {theme.fontSerif === 'font-serif' ? 'Cormorant / Lora' : 'Great Vibes / Inter'} serta palet warna dominan.
                        </p>
                      </div>

                      <div className="relative z-10 p-4 border-t border-[var(--color-outline-variant)] flex gap-3 bg-surface-container-low backdrop-blur-md">
                        <button
                          onClick={() => setPreviewThemeId(theme.id)}
                          className="flex-1 py-2.5 text-[11px] font-bold text-primary bg-white border border-outline-variant hover:bg-surface-container-low hover:border-primary/40 transition-colors uppercase tracking-wider rounded-xl cursor-pointer text-center"
                        >
                          Lihat Preview
                        </button>
                        <button
                          onClick={() => { wedding.setThemeId(theme.id); setIsSelectingTheme(false); }}
                          className="flex-1 py-2.5 text-[11px] font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors uppercase tracking-wider rounded-xl cursor-pointer text-center shadow-md"
                        >
                          Gunakan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MODAL PREVIEW TEMA — BINGKAI HP */}
              {previewThemeId && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewThemeId(null)}>
                  <div className="relative w-full max-w-[375px] h-[80vh] max-h-[720px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {/* Close */}
                    <button
                      onClick={() => setPreviewThemeId(null)}
                      className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer z-[10000]"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>

                    {/* Phone Frame */}
                    <div className="flex-1 rounded-[2.5rem] border-[6px] border-[#1A1A1A] bg-[#1A1A1A] shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1A1A1A] z-[200] rounded-b-2xl flex justify-center items-end pb-1">
                        <div className="w-14 h-1.5 bg-black/50 rounded-full" />
                      </div>

                      {/* Invitation Preview */}
                      <div className="flex-1 w-full h-full relative z-[100] bg-white overflow-y-auto rounded-[2rem]">
                        <InvitationPreview
                          data={weddingData}
                          themeId={previewThemeId}
                          onAddRSVP={() => {}}
                          rsvps={[]}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 flex justify-center animate-slideUp" style={{ animationDelay: '200ms' }}>
                      <button
                        onClick={() => {
                          wedding.setThemeId(previewThemeId);
                          setPreviewThemeId(null);
                          setIsSelectingTheme(false);
                        }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all cursor-pointer hover:scale-105 uppercase tracking-widest text-xs"
                      >
                        <CheckCircle className="w-4 h-4" /> Gunakan Tema Ini
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>`;

if (content.includes('PILIH TEMA <ChevronRight')) {
    content = content.replace(oldSection, newSection);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("SUCCESS: Theme grid replaced and phone preview modal added.");
} else {
    console.log("ERROR: Could not find the old theme grid section.");
    console.log("Searching for alternatives...");
    // Try a simpler search
    if (content.includes('PILIH TEMA')) {
        console.log("Found 'PILIH TEMA' in file but full block didn't match.");
    }
}
