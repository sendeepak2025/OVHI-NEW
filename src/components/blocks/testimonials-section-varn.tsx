import React, { useState } from 'react';
import { Star, User, Building, Stethoscope, Brain, Pill, Users } from 'lucide-react';

const ClientTestimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      title: "Family Practice Physician",
      organization: "Johnson Family Medicine",
      quote: "Varn DigiHealth transformed our practice management. The patient portal reduced our administrative calls by 60%, and the integrated billing system streamlined our revenue cycle. Our patients love the convenience, and we've seen a 40% increase in patient satisfaction scores.",
      rating: 5,
      avatar: "SJ",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      icon: <Stethoscope className="w-5 h-5" />,
      specialty: "Primary Care"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      title: "Clinical Director",
      organization: "Mindful Wellness Center",
      quote: "The telehealth platform has been revolutionary for our mental health practice. We've expanded our reach to underserved communities and maintained continuity of care during challenging times. The security features give us complete confidence in patient confidentiality.",
      rating: 5,
      avatar: "MC",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      icon: <Brain className="w-5 h-5" />,
      specialty: "Mental Health"
    },
    {
      id: 3,
      name: "Jennifer Martinez",
      title: "Pharmacy Manager",
      organization: "HealthFirst Pharmacy",
      quote: "The prescription management system has eliminated errors and improved our workflow efficiency by 50%. The automated refill reminders and drug interaction alerts have significantly enhanced patient safety. Our customers appreciate the seamless experience.",
      rating: 5,
      avatar: "JM",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      icon: <Pill className="w-5 h-5" />,
      specialty: "Pharmacy"
    },
    {
      id: 4,
      name: "Robert Thompson",
      title: "Medical Director",
      organization: "Central Valley Medical Group",
      quote: "Managing our 15-provider multi-specialty clinic became effortless with Varn DigiHealth. The unified dashboard gives us real-time insights into operations across all departments. We've reduced patient wait times by 35% and increased provider productivity significantly.",
      rating: 5,
      avatar: "RT",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      icon: <Users className="w-5 h-5" />,
      specialty: "Multi-Specialty"
    }
  ];

  const StarRating = ({ rating}) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Healthcare providers across the country trust Varn DigiHealth to streamline their operations, 
            improve patient care, and drive better outcomes.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-300 group ${
                index === activeTestimonial ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setActiveTestimonial(index)}
            >
              {/* Specialty Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${testimonial.bgColor}`}>
                    <div className={testimonial.textColor}>
                      {testimonial.icon}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {testimonial.specialty}
                  </span>
                </div>
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Quote */}
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Client Info */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center`}>
                  <span className={`text-lg font-bold ${testimonial.textColor}`}>
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.organization}</p>
                </div>
              </div>

              {/* Hover Effect Indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
              <div className="text-gray-600">Average Efficiency Gain</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Ready to join hundreds of satisfied healthcare providers?
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
            Schedule Your Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonials;