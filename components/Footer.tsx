import Link from 'next/link';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scissors className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                JediClip
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered long-to-short video generator. Built by Jedi Labs.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Product</h4>
            <div className="flex flex-col gap-2">
              {['Features', 'Pricing', 'FAQ', 'Changelog'].map((item) => (
                <a
                  key={item}
                  href={item === 'Changelog' ? '#' : `#${item.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Resources</h4>
            <div className="flex flex-col gap-2">
              {['Documentation', 'API Reference', 'Blog', 'Status'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Company</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Jedi Labs', href: 'https://jedilabs.org' },
                { label: 'About', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Privacy Policy', href: '#' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Jedi Labs. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Agentic AI Co-Pilots for SMBs.{' '}
            <Link
              href="https://jedilabs.org"
              target="_blank"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              jedilabs.org
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
