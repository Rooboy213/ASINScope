import { Link } from "wouter";

export function PublicFooter() {
  return (
    <footer className="bg-card border-t py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">N</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                NumVerify
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premium Amazon marketplace growth agency for ambitious brands. We turn data into market dominance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary transition-colors">Amazon SEO & Ranking</Link></li>
              <li><Link href="/rank-tracker" className="hover:text-primary transition-colors">Amazon Rank Tracker</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">PPC Management</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Listing Optimization</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Brand Protection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NumVerify. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
