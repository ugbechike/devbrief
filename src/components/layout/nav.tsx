"use client";

import { Box, Text, ThemeToggle, Button } from "~/components/ui";
import { useState } from "react";
import { useOutsideClicks } from "~/hooks/useOutsideClicks";

export function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const mobileMenuRef = useOutsideClicks({
    onOutsideClick: closeMobileMenu,
    onEscape: closeMobileMenu,
    enabled: isMobileMenuOpen,
  });

  return (
    <Box
      as="nav"
      className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      ref={mobileMenuRef}
    >
      <Box
        variant="container-xl"
        className="flex h-16 items-center justify-between"
      >
        {/* Logo */}
        <Box className="flex items-center space-x-2">
          <Text variant="heading" className="font-bold text-primary">
            DevBrief
          </Text>
        </Box>

        {/* Right side - Theme toggle and Auth buttons */}
        <Box className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Auth buttons - Desktop */}
          <Box className="hidden sm:flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button size="sm">Sign Up</Button>
          </Box>

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-4 w-4 transition-transform ${
                isMobileMenuOpen ? "rotate-90" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </Button>
        </Box>
      </Box>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <Box className="sm:hidden border-t border-border bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200">
          <Box variant="container-xl" className="py-4 space-y-4">
            <Box className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Login
              </Button>
              <Button className="w-full justify-start">Sign Up</Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
