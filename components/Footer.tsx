import Link from 'next/link';
import { Play, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-white p-1.5 rounded-md">
                <Play className="w-3 h-3 text-black fill-black" />
              </div>
              <span className="font-semibold text-white tracking-tight">VidMetrics</span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs">
              The ultimate YouTube competitor analytics platform for enterprise content teams and creators.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-zinc-100 text-sm">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-zinc-100 text-sm">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-zinc-100 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} VidMetrics Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
