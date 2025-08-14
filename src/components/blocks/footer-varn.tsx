import React from 'react';
import { 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Facebook 
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Varn DigiHealth</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Transforming healthcare through innovative digital solutions. 
              We provide comprehensive healthcare IT services that improve 
              patient outcomes and streamline operations.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Services', 'Why Choose Us', 'Testimonials', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Our Services</h4>
            <ul className="space-y-2">
              {[
                'EHR System',
                'Medical Billing',
                'Credentialing',
                'RPM/CCM',
                'Telehealth'
              ].map((service) => (
                <li key={service}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-gray-900 text-sm font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-gray-900 text-sm font-medium">info@varndigihealth.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">Business Hours</p>
                  <p className="text-gray-900 text-sm font-medium">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-900 text-sm font-medium">Sat: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-start space-x-6">
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm font-medium"
              >
                HIPAA Compliance
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                © 2024 Varn DigiHealth. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};