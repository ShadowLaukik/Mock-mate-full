
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { Menu, X, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuthModal = (type: "signin" | "signup") => {
    setAuthType(type);
    setAuthModalOpen(true);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle smooth scroll to sections on home page
  const handleSectionNavigation = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    // If we're already on the home page
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl md:text-2xl text-gradient">
                MockMate
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-foreground/80 hover:text-mockmate-primary transition-colors"
                onClick={() => handleSectionNavigation("home")}
              >
                Home
              </Link>
              <Link
                to="/"
                className="text-foreground/80 hover:text-mockmate-primary transition-colors"
                onClick={() => handleSectionNavigation("features")}
              >
                Features
              </Link>
              <Link
                to="/"
                className="text-foreground/80 hover:text-mockmate-primary transition-colors"
                onClick={() => handleSectionNavigation("roles")}
              >
                Roles
              </Link>
            </nav>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                    >
                      <User size={18} />
                      <span className="capitalize">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link to="/dashboard" className="w-full">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("signin")}
                  >
                    Sign in
                  </Button>
                  <Button onClick={() => openAuthModal("signup")}>
                    Sign up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg animate-fade-in">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/"
                className="block py-2 text-foreground/80 hover:text-mockmate-primary"
                onClick={() => {
                  handleSectionNavigation("home");
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </Link>
              <Link
                to="/"
                className="block py-2 text-foreground/80 hover:text-mockmate-primary"
                onClick={() => {
                  handleSectionNavigation("features");
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </Link>
              <Link
                to="/"
                className="block py-2 text-foreground/80 hover:text-mockmate-primary"
                onClick={() => {
                  handleSectionNavigation("roles");
                  setIsMobileMenuOpen(false);
                }}
              >
                Roles
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-2 text-mockmate-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openAuthModal("signin");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      openAuthModal("signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authType}
      />
    </>
  );
};

export default Navbar;
