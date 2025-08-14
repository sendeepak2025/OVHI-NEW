import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Calendar,
  BarChart3,
  CreditCard,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  HeartHandshake,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowRight,
  Play,
  Monitor,
  Brain,
  Activity,
  Heart,
  Stethoscope,
  TrendingUp,
  DollarSign,
  UserCheck,
  Sparkles,
  ChevronRight,
  Database,
  Cloud,
  Laptop,
  Smartphone,
  Globe,
  Lock,
  Award,
  Target,
  Lightbulb,
  Gauge,
  PieChart,
  BarChart,
  LineChart,
  Settings,
  MessageSquare,
  Video,
  Headphones,
  CheckCircle2,
  ArrowUp,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MegaMenuNavbar } from "@/components/blocks/navbar-mega-menu";
import { HeroSectionVarn } from "@/components/blocks/hero-section-varn";
import { AboutSectionVarn } from "@/components/blocks/about-section-varn";
import { ServicesSectionVarn } from "@/components/blocks/services-section-varn";
import { MedicalBillingCodingSection } from "@/components/blocks/medical-billing-coding-section";
import { WhyChooseSectionVarn } from "@/components/blocks/why-choose-section-varn";
import ClientTestimonials from "@/components/blocks/testimonials-section-varn";
import { ContactUs } from "@/components/blocks/contact-section-varn";
import { Footer } from "@/components/blocks/footer-varn";

export default function Home() {
  return (
    <div className="relative">
      <MegaMenuNavbar />
      <HeroSectionVarn />
      <AboutSectionVarn />
      <ServicesSectionVarn />
      <MedicalBillingCodingSection />
      <WhyChooseSectionVarn />
      <ClientTestimonials />
      <ContactUs />
      <Footer />
    </div>
  );
}
