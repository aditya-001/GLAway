import {
  Bars3Icon,
  MoonIcon,
  ShoppingBagIcon,
  SparklesIcon,
  SunIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUISettings } from "../context/UISettingsContext";
import Button from "./Button";

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200";

const navClassName = ({ isActive }) =>
  `${linkBase} ${
    isActive
      ? "bg-brand-500 text-white"
      : "text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/80"
  }`;

const Navbar = ({ cartCount }) => {
  const location = useLocation();
  const {
    user,
    admin,
    isUserAuthenticated,
    isAdminAuthenticated,
    logoutUser,
    logoutAdmin
  } = useAuth();
  const { theme, toggleTheme } = useUISettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminArea = location.pathname.startsWith("/admin");
  const homeTarget = isAdminArea ? "/admin/dashboard" : "/home";

  const navLinks = isAdminArea
    ? [
        { to: "/admin/dashboard", label: "Dashboard" },
        { to: "/admin/manage-food", label: "Manage Food" },
        { to: "/admin/animation-settings", label: "Animations" }
      ]
    : [
        { to: "/home", label: "Home" },
        { to: "/cart", label: "Cart" },
        { to: "/order-status", label: "Orders" }
      ];

  return (
    <>
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={homeTarget} className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-red-500 text-white shadow-lg shadow-orange-200/60 dark:shadow-orange-900/30">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                GLAWay
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdminArea ? "Canteen control deck" : "Smart campus food ordering"}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClassName}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {!isAdminArea && (
              <Link
                to="/cart"
                className="relative rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
              >
                <ShoppingBagIcon className="h-5 w-5 text-slate-800 dark:text-slate-100" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            <div className="hidden items-center gap-3 md:flex">
              {isAdminArea ? (
                isAdminAuthenticated ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {admin.name}
                      </p>
                      <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                        {admin.outlet}
                      </p>
                    </div>
                <Button variant="dark" onClick={logoutAdmin}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/admin/login">
                <Button variant="dark">Admin Login</Button>
              </Link>
            )
          ) : isUserAuthenticated ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                      Student
                    </p>
                  </div>
                  <Button variant="dark" onClick={logoutUser}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/admin/login">
                    <Button variant="secondary">Admin</Button>
                  </Link>
                  <Link to="/login">
                    <Button>Login</Button>
                  </Link>
                </>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 240 }}
              className="absolute right-0 top-0 flex h-full w-[84vw] max-w-sm flex-col bg-white p-5 shadow-2xl dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    GLAWay
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isAdminArea ? "Staff navigation" : "Student navigation"}
                  </p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 font-semibold ${
                        isActive
                          ? "bg-brand-500 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto space-y-3 pt-6">
                {isAdminArea ? (
                  isAdminAuthenticated ? (
                    <Button variant="dark" className="w-full" onClick={logoutAdmin}>
                      Logout
                    </Button>
                  ) : (
                    <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="dark" className="w-full">
                        Admin Login
                      </Button>
                    </Link>
                  )
                ) : isUserAuthenticated ? (
                  <Button variant="dark" className="w-full" onClick={logoutUser}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Student Login</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
