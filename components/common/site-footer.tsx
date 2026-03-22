import Link from "next/link";
import { Brain, Github, Twitter, Mail } from "lucide-react";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Workspaces", href: "/select-org" },
    ],
    Access: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Sign Up", href: "/sign-up" },
      { label: "Select Org", href: "/select-org" },
    ],
    Workspace: [
      { label: "Dashboard", href: "/select-org" },
      { label: "Documents", href: "/select-org" },
      { label: "Upload", href: "/select-org" },
    ],
    Support: [
      { label: "Create Workspace", href: "/sign-up" },
      { label: "Switch Organization", href: "/select-org" },
      { label: "Contact Us", href: "mailto:support@lumina-hq.com" },
    ],
  };

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com",
      label: "GitHub",
    },
    {
      icon: <Twitter className="h-5 w-5" />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:support@lumina-hq.com",
      label: "Email",
    },
  ];

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Lumina-HQ</span>
            </div>
            <p className="mb-6 max-w-md text-gray-600">
              AI-powered document analysis for teams. Upload, analyze, and
              collaborate on documents inside isolated organization workspaces.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-lg font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <div className="mb-4 text-gray-600 md:mb-0">
            © {currentYear} Lumina-HQ. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/sign-in" className="hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-gray-900">
              Sign Up
            </Link>
            <Link href="/select-org" className="hover:text-gray-900">
              Workspaces
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
