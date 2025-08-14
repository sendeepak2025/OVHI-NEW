import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Stethoscope,
  FileText,
  Shield,
  Activity,
  Video,
  Bot,
  Building2,
  User,
  Pill,
  Brain,
  Target,
  Users,
  BookOpen,
  FileBarChart,
  FileCheck,
  Calendar,
  HelpCircle,
  Phone,
  ChevronDown,
  Zap,
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Laptop,
  Headphones,
} from "lucide-react";
import { Link } from "react-router-dom";

interface MegaMenuCategory {
  title: string;
  icon: React.ReactNode;
  description: string;
  href: string;
}

interface MegaMenuSection {
  title: string;
  categories: MegaMenuCategory[];
}

interface NavItem {
  name: string;
  href?: string;
  hasMegaMenu?: boolean;
  megaMenuContent?: MegaMenuSection[];
}

const navItems: NavItem[] = [
  {
    name: "Services",
    hasMegaMenu: true,
    megaMenuContent: [
      {
        title: "Core Services",
        categories: [
          {
            title: "Medical Billing & Coding",
            icon: <FileText className="w-5 h-5" />,
            description:
              "Complete revenue cycle management and coding services",
            href: "/services/billing-coding",
          },
          {
            title: "EHR & Practice Management",
            icon: <Activity className="w-5 h-5" />,
            description: "Comprehensive electronic health records solutions",
            href: "/services/ehr",
          },
          {
            title: "Credentialing Services",
            icon: <Shield className="w-5 h-5" />,
            description: "Provider enrollment and credentialing management",
            href: "/services/credentialing",
          },
        ],
      },
      {
        title: "Digital Health",
        categories: [
          {
            title: "Remote Patient Monitoring",
            icon: <Heart className="w-5 h-5" />,
            description: "Advanced RPM solutions for better patient outcomes",
            href: "/services/rpm",
          },
          {
            title: "Telehealth Solutions",
            icon: <Video className="w-5 h-5" />,
            description: "Seamless virtual care delivery platforms",
            href: "/services/telehealth",
          },
          {
            title: "AI-Powered Automation",
            icon: <Bot className="w-5 h-5" />,
            description: "Intelligent automation for healthcare workflows",
            href: "/services/ai-automation",
          },
        ],
      },
    ],
  },
  {
    name: "Solutions",
    hasMegaMenu: true,
    megaMenuContent: [
      {
        title: "Practice Types",
        categories: [
          {
            title: "For Clinics",
            icon: <Building2 className="w-5 h-5" />,
            description: "Scalable solutions for multi-location clinics",
            href: "/solutions/clinics",
          },
          {
            title: "For Private Practices",
            icon: <User className="w-5 h-5" />,
            description: "Tailored solutions for independent practices",
            href: "/solutions/private-practices",
          },
          {
            title: "For Pharmacies",
            icon: <Pill className="w-5 h-5" />,
            description: "Comprehensive pharmacy management systems",
            href: "/solutions/pharmacies",
          },
        ],
      },
      {
        title: "Specialties",
        categories: [
          {
            title: "For Mental Health",
            icon: <Brain className="w-5 h-5" />,
            description: "Specialized tools for mental health providers",
            href: "/solutions/mental-health",
          },
          {
            title: "For Specialists",
            icon: <Target className="w-5 h-5" />,
            description: "Advanced solutions for specialty practices",
            href: "/solutions/specialists",
          },
          {
            title: "For Large Practices",
            icon: <Users className="w-5 h-5" />,
            description: "Enterprise-grade solutions for large organizations",
            href: "/solutions/large-practices",
          },
        ],
      },
    ],
  },
  // {
  //   name: "Resources",
  //   hasMegaMenu: true,
  //   megaMenuContent: [
  //     {
  //       title: "Knowledge Base",
  //       categories: [
  //         {
  //           title: "Blog & Articles",
  //           icon: <BookOpen className="w-5 h-5" />,
  //           description: "Latest insights and industry trends",
  //           href: "/resources/blog",
  //         },
  //         {
  //           title: "Case Studies",
  //           icon: <FileBarChart className="w-5 h-5" />,
  //           description: "Real-world success stories and results",
  //           href: "/resources/case-studies",
  //         },
  //         {
  //           title: "Whitepapers",
  //           icon: <FileCheck className="w-5 h-5" />,
  //           description: "In-depth research and analysis",
  //           href: "/resources/whitepapers",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Support & Learning",
  //       categories: [
  //         {
  //           title: "Webinars",
  //           icon: <Calendar className="w-5 h-5" />,
  //           description: "Live and recorded educational sessions",
  //           href: "/resources/webinars",
  //         },
  //         {
  //           title: "Documentation",
  //           icon: <HelpCircle className="w-5 h-5" />,
  //           description: "Comprehensive guides and API docs",
  //           href: "/resources/documentation",
  //         },
  //         {
  //           title: "Support Center",
  //           icon: <Headphones className="w-5 h-5" />,
  //           description: "24/7 technical support and assistance",
  //           href: "/resources/support",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export const MegaMenuNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuEnter = (menuName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuName);
    setHoveredItem(menuName);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setHoveredItem(null);
    }, 100);
  };

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveMenu(null);
    setHoveredItem(null);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const megaMenuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      x: "100%",
    },
    visible: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: "100%",
    },
  };

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
            : "bg-white/90 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
                  whileHover={{
                    boxShadow: "0 0 20px rgba(30, 64, 175, 0.3)",
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Stethoscope className="w-5 h-5 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <Link to={"/"} className="text-xl cursor-pointer font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Varn DigiHealth
                </Link>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() =>
                    item.hasMegaMenu && handleMenuEnter(item.name)
                  }
                  onMouseLeave={() => item.hasMegaMenu && handleMenuLeave()}
                >
                  <motion.a
                    href={item.href || "#"}
                    className={cn(
                      "relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-gray-50 hover:text-primary",
                      hoveredItem === item.name
                        ? "text-primary bg-gray-50"
                        : "text-gray-700"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{item.name}</span>
                    {item.hasMegaMenu && (
                      <motion.div
                        animate={{
                          rotate: hoveredItem === item.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </motion.div>
                    )}
                    {hoveredItem === item.name && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                        layoutId="activeIndicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.a>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={"/login"}>
                  <Button
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl"
              variants={megaMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {navItems
                  .find((item) => item.name === activeMenu)
                  ?.megaMenuContent?.map((section, sectionIndex) => (
                    <div key={section.title} className="mb-8 last:mb-0">
                      <motion.h3
                        className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                        variants={itemVariants}
                      >
                        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                        {section.title}
                      </motion.h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.categories.map((category, categoryIndex) => (
                          <motion.a
                            key={category.title}
                            href={category.href}
                            className="group p-4 rounded-xl border border-gray-200 hover:border-primary/30 bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
                            variants={itemVariants}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <motion.div
                                className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 10,
                                }}
                              >
                                {category.icon}
                              </motion.div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors mb-1">
                                  {category.title}
                                </h4>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                  {category.description}
                                </p>
                              </div>
                              <motion.div
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                whileHover={{ x: 5 }}
                              >
                                <ArrowRight className="w-4 h-4 text-primary" />
                              </motion.div>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                <Link to={"/"} className="text-xl cursor-pointer font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Varn DigiHealth
                </Link>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    custom={index}
                  >
                    <a
                      href={item.href || "#"}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                      {item.hasMegaMenu && (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </a>
                  </motion.div>
                ))}
                <motion.div className="pt-4 border-t" variants={itemVariants}>
                  <Link to={"/login"}>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
