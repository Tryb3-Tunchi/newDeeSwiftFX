import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const About = () => {
  const teamMembers = [
    {
      name: "David Chen",
      position: "CEO & Founder",
      bio: "A visionary leader with over 15 years in quantitative trading, David drives DeeSwiftFx’s mission to democratize trading.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Sarah Williams",
      position: "Chief Technology Officer",
      bio: "Sarah’s expertise in AI and fintech innovation powers our cutting-edge trading algorithms.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Michael Rodriguez",
      position: "Head of Trading",
      bio: "Michael’s deep knowledge of crypto markets ensures our strategies remain competitive.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Lisa Patel",
      position: "Chief Compliance Officer",
      bio: "Lisa ensures our platform adheres to global financial regulations with utmost transparency.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Mitchelle Ryan",
      position: "DATA analyst Officer",
      bio: "Mitchelle ensures our platform is well structured and easy to use.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const milestones = [
    { year: "2018", event: "DeeSwiftFx Trade founded with a vision to revolutionize trading." },
    { year: "2019", event: "Launched first AI-driven trading algorithm." },
    { year: "2021", event: "Reached $100M in assets under management." },
    { year: "2023", event: "Expanded to support global markets and multi-asset trading." },
    { year: "2025", event: "Surpassed 50,000 active traders worldwide." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-100 text-white py-24">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            About DeeSwiftFx Trade
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            We’re transforming the trading landscape by merging advanced technology with unparalleled financial expertise.
          </p>
        </div>

        {/* Mission & Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl p-10 backdrop-blur-sm animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              To empower traders worldwide with professional-grade tools, making sophisticated trading accessible, secure, and seamless for all.
            </p>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="p-6 bg-blue-700 rounded-xl shadow-md">
                <div className="text-4xl font-bold text-blue-300 mb-2">2018</div>
                <p className="text-blue-200">Year Founded</p>
              </div>
              <div className="p-6 bg-blue-700 rounded-xl shadow-md">
                <div className="text-4xl font-bold text-blue-300 mb-2">24/7</div>
                <p className="text-blue-200">Global Support</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl p-10 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
            <ul className="space-y-4">
              {["Transparency in Operations", "Innovation in Technology", "Security of Assets", "Empowerment through Education"].map((value, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-blue-400 text-2xl mr-4">✓</span>
                  <span className="text-blue-100">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-400"></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center mb-12 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} animate-fade-in-up`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-1/2 px-6">
                  <div className="bg-blue-800 bg-opacity-70 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-blue-300">{milestone.year}</h3>
                    <p className="text-blue-100">{milestone.event}</p>
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Carousel Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">Our Leadership Team</h2>
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 5000 }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="mySwiper"
          >
            {teamMembers.map((member, index) => (
              <SwiperSlide key={index}>
                <div className="bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl p-6 text-center backdrop-blur-sm">
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                  <p className="text-blue-300 mb-4">{member.position}</p>
                  <p className="text-blue-100">{member.bio}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Contact Information Section */}
        <div className="text-center bg-blue-800 bg-opacity-70 rounded-2xl p-10 max-w-4xl mx-auto backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Reach out to our team for inquiries, partnerships, or support. We’re here to help you succeed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-blue-100">support@deeswiftfxtrade.com</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-blue-100">+1 (800) 123-4567</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Address</h3>
              <p className="text-blue-100">123 Finance St, New York, NY 10001</p>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-block mt-8 bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Tailwind Animations and Swiper Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          .swiper-button-prev, .swiper-button-next {
            color: #60a5fa;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .swiper-button-prev:after, .swiper-button-next:after {
            font-size: 20px;
          }
        `}
      </style>
    </div>
  );
};

export default About;