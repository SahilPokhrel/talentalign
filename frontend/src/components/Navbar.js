import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { Menu, X } from "lucide-react";

/**
 * Props
 * - hideCta?: boolean         // hides "Try It Now" button
 * - guardNavigation?: boolean // if true, intercept in-app nav clicks and ask parent
 * - onNavAttempt?: (href: string) => void
 */
function Navbar({ hideCta = false, guardNavigation = false, onNavAttempt }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const go = (e, href) => {
    if (guardNavigation && onNavAttempt) {
      e.preventDefault();
      onNavAttempt(href);
    }
  };

  return (
    <Disclosure
      as="nav"
      className={`fixed top-0 left-0 right-0 shadow z-50 transition ${scrolled ? "bg-white/90 backdrop-blur-md" : "bg-white"
        }`}
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo (acts like Home) */}
              <a href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="TalentAlign Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-2xl font-bold text-[#0F172A]">TalentAlign</span>
              </a>


              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                <a
                  href="/"
                  onClick={(e) => go(e, "/")}
                  className="hover:text-[#6366F1] font-medium"
                >
                  Home
                </a>
                <a
                  href="/#features"
                  onClick={(e) => go(e, "/#features")}
                  className="hover:text-[#6366F1] font-medium"
                >
                  Features
                </a>
                <a
                  href="/#about"
                  onClick={(e) => go(e, "/#about")}
                  className="hover:text-[#6366F1] font-medium"
                >
                  About
                </a>
                {!hideCta && (
                  <a
                    href="/resume"
                    onClick={(e) => go(e, "/resume")}
                    className="bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#4F46E5] transition"
                  >
                    Try It Now
                  </a>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Disclosure.Button className="p-2 rounded-md text-[#0F172A] hover:bg-gray-100">
                  {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <Disclosure.Panel className="md:hidden bg-white px-4 pt-2 pb-4 space-y-2 shadow">
            <a
              href="/"
              onClick={(e) => go(e, "/")}
              className="block hover:text-[#6366F1] font-medium"
            >
              Home
            </a>
            <a
              href="/#features"
              onClick={(e) => go(e, "/#features")}
              className="block hover:text-[#6366F1] font-medium"
            >
              Features
            </a>
            <a
              href="/#about"
              onClick={(e) => go(e, "/#about")}
              className="block hover:text-[#6366F1] font-medium"
            >
              About
            </a>
            {!hideCta && (
              <a
                href="/resume"
                onClick={(e) => go(e, "/resume")}
                className="block bg-[#6366F1] text-white px-4 py-2 rounded-lg text-center hover:bg-[#4F46E5] transition"
              >
                Try It Now
              </a>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
