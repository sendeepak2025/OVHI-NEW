import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Clock, User, Calendar, ArrowRight, Mail, Filter, ChevronLeft, ChevronRight, TrendingUp, Shield, Monitor, Stethoscope, CreditCard, Users, FileText, Zap } from "lucide-react"
import { MegaMenuNavbar } from "@/components/blocks/navbar-mega-menu"
import { Footer } from "@/components/blocks/footer-varn"

const featuredArticles = [
  {
    id: 1,
    title: "The Future of EHR Integration: Trends and Predictions for 2024",
    excerpt: "Explore the latest developments in Electronic Health Record systems and how they're transforming patient care delivery across healthcare organizations.",
    category: "EHR",
    author: "Dr. Sarah Chen",
    date: "March 15, 2024",
    readTime: "8 min read",
    image: "/api/placeholder/400/240",
    featured: true
  },
  {
    id: 2,
    title: "HIPAA Compliance in the Cloud: Essential Security Measures",
    excerpt: "A comprehensive guide to maintaining HIPAA compliance when migrating healthcare data to cloud-based systems and platforms.",
    category: "Compliance",
    author: "Michael Rodriguez",
    date: "March 12, 2024",
    readTime: "6 min read",
    image: "/api/placeholder/400/240",
    featured: true
  },
  {
    id: 3,
    title: "Telehealth Implementation: Lessons from Leading Health Systems",
    excerpt: "Real-world case studies and best practices for successful telehealth deployment in various healthcare settings.",
    category: "Telemedicine",
    author: "Jennifer Park",
    date: "March 10, 2024",
    readTime: "10 min read",
    image: "/api/placeholder/400/240",
    featured: true
  }
]

const articles = [
  {
    id: 4,
    title: "AI-Powered Diagnostics: Revolutionizing Healthcare Decision Making",
    excerpt: "How artificial intelligence is transforming medical diagnostics and improving patient outcomes through advanced analytics.",
    category: "Technology",
    author: "Dr. James Wilson",
    date: "March 8, 2024",
    readTime: "7 min read",
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    title: "Revenue Cycle Management: Optimizing Healthcare Financial Operations",
    excerpt: "Strategies for improving revenue cycle efficiency and reducing claim denials in healthcare organizations.",
    category: "Billing",
    author: "Amanda Foster",
    date: "March 5, 2024",
    readTime: "9 min read",
    image: "/api/placeholder/300/200"
  },
  {
    id: 6,
    title: "Cybersecurity Best Practices for Healthcare IT Infrastructure",
    excerpt: "Essential security measures to protect sensitive healthcare data from cyber threats and ensure system integrity.",
    category: "Security",
    author: "David Kim",
    date: "March 3, 2024",
    readTime: "5 min read",
    image: "/api/placeholder/300/200"
  },
  {
    id: 7,
    title: "Patient Portal Optimization: Enhancing User Experience",
    excerpt: "Design principles and features that improve patient engagement through intuitive portal interfaces.",
    category: "Technology",
    author: "Lisa Thompson",
    date: "March 1, 2024",
    readTime: "6 min read",
    image: "/api/placeholder/300/200"
  },
  {
    id: 8,
    title: "Interoperability Standards: Building Connected Healthcare Systems",
    excerpt: "Understanding FHIR, HL7, and other standards that enable seamless data exchange between healthcare systems.",
    category: "EHR",
    author: "Robert Johnson",
    date: "February 28, 2024",
    readTime: "8 min read",
    image: "/api/placeholder/300/200"
  },
  {
    id: 9,
    title: "Population Health Management: Data-Driven Care Strategies",
    excerpt: "Leveraging healthcare data analytics to improve population health outcomes and reduce costs.",
    category: "Analytics",
    author: "Dr. Maria Gonzalez",
    date: "February 25, 2024",
    readTime: "7 min read",
    image: "/api/placeholder/300/200"
  }
]

const categories = [
  { name: "All", icon: BookOpen, count: 24 },
  { name: "EHR", icon: Monitor, count: 8 },
  { name: "Compliance", icon: Shield, count: 6 },
  { name: "Telemedicine", icon: Stethoscope, count: 5 },
  { name: "Technology", icon: Zap, count: 7 },
  { name: "Billing", icon: CreditCard, count: 4 },
  { name: "Security", icon: Shield, count: 3 },
  { name: "Analytics", icon: TrendingUp, count: 2 }
]

export default function BlogPage() {
  return (
    <>
    <MegaMenuNavbar/>
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Healthcare IT Insights &{" "}
              <span className="text-blue-600">Industry Trends</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Stay informed with expert analysis, best practices, and the latest developments 
              in healthcare technology. Our resources help healthcare professionals navigate 
              the evolving digital landscape.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search articles, topics, or authors..."
                className="pl-12 pr-4 py-6 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Articles</h2>
          <p className="text-lg text-slate-600">Latest insights from healthcare IT experts</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-green-500 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <Badge className="absolute top-4 left-4 bg-white text-blue-600 hover:bg-white">
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3">{article.excerpt}</p>
                
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{article.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{article.date}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{article.readTime}</span>
                </div>
                
                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Browse by Category</h2>
            <p className="text-slate-600">Find articles on specific healthcare IT topics</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.name}
                  variant="outline"
                  className="h-auto p-4 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <IconComponent className="h-5 w-5 mr-2 text-slate-500 group-hover:text-blue-600" />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
                <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700">
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3 text-sm">{article.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{article.date}</span>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-12 space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="px-3 py-2 text-slate-500">...</span>
            <Button variant="outline" size="sm">8</Button>
          </div>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <div className="mb-6">
              <Mail className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
              <p className="text-xl text-white/90">
                Get the latest healthcare IT insights and industry updates delivered to your inbox
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
              />
              <Button className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-white/80 mt-4">
              Join 10,000+ healthcare professionals. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  )
}