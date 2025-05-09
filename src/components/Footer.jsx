import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 shadow-inner">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl flex items-center font-bold mb-3">
            <div><img className="w-14 sm:w-10 p-0 m-0" src="logo.png" alt="" width={1} /></div>
            <span className="text-blue-300">Dee</span>SwiftFx Trade
          </h3>
          <p className="text-blue-100">
            Innovative investment solutions for the modern investor
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold mb-3 text-blue-300">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  News
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-blue-300">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-blue-100 hover:text-white transition duration-300"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-blue-300">Contact</h4>
            <ul className="space-y-2">
              <li className="text-blue-100">info@deeswiftFX.com</li>
              <li className="text-blue-100">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-blue-700 text-center">
        <p className="text-blue-200">
          © 2023 DeeSwiftFx Trade. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
