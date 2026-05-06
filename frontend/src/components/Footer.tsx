

const Footer = () => (
  <footer className="py-8 border-t border-border bg-muted/30">
    <div className="container mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-sm bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
          <img src="/farmeze-icon.png" alt="Farmeze logo" className="w-4 h-4 object-cover" />
        </div>
        <span className="text-sm font-semibold text-foreground">Farmeze</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Smart Quality Grading & Inventory Management Demo · College Project Presentation
      </p>
    </div>
  </footer>
);

export default Footer;
