export default function VersionPage() {
  return (
    <div className="container min-h-screen py-20 px-4 flex items-center justify-center">
      <div className="glass-panel p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
          Version Check
        </h1>
        <div className="space-y-4 text-left">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-white/40 mb-1">Build Time</div>
            <div className="text-white font-mono">{new Date().toISOString()}</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-white/40 mb-1">Version</div>
            <div className="text-white font-mono">2.0.0 - Footer Fix</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-white/40 mb-1">Features</div>
            <ul className="text-white text-sm space-y-1">
              <li>✅ Sticky Footer</li>
              <li>✅ Uploader Info</li>
              <li>✅ Text Overflow Fix</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
