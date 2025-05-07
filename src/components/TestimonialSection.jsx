import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TestimonialSection.css";

const TestimonialSection = () => {
  const testimonials = [
    {
      quote:
        "DeeSwiftFx Trade has transformed my investment strategy. Their platform is intuitive and the returns have exceeded my expectations.",
      author: "Sarah Johnson",
      position: "Tech Entrepreneur",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      quote:
        "I've been investing with DeeSwiftFx Trade for two years now. Their customer service is exceptional and the portfolio performance speaks for itself.",
      author: "Michael Chen",
      position: "Financial Analyst",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      quote:
        "As someone new to investing, DeeSwiftFx Trade made the process simple and transparent. I appreciate their educational resources and personalized approach.",
      author: "Emily Rodriguez",
      position: "Healthcare Professional",
      rating: 4,
      image: "https://i.pravatar.cc/150?img=4",
    },
    {
      quote:
        "The analytical tools provided by DeeSwiftFx Trade have helped me make informed investment decisions. Their platform is a game-changer.",
      author: "David Smith",
      position: "Data Scientist",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      quote:
        "I'm impressed by the consistent returns and professional guidance. DeeSwiftFx Trade has exceeded my expectations in every way.",
      author: "Lisa Wong",
      position: "Business Owner",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=6",
    },
    {
      quote:
        "The personalized investment strategies and attentive support team make DeeSwiftFx Trade stand out in the industry.",
      author: "James Martinez",
      position: "Marketing Director",
      rating: 4,
      image: "https://i.pravatar.cc/150?img=7",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say
            about their experience with DeeSwiftFx Trade.
          </p>
        </div>

        <div className="testimonial-slider">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-blue-100 text-blue-800 px-6 py-4 rounded-lg inline-block">
            <p className="font-bold">4.8/5 Average Rating</p>
            <p className="text-sm">Based on 500+ client reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
