import React from "react";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                backgroundColor: "#1c2331",
                color: "#b0b0b0",
                padding: "50px 20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    maxWidth: "1200px",
                    margin: "0 auto 30px auto",
                }}
            >
                {/* Company */}
                <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
                    <h5 style={{ color: "#fff", marginBottom: "15px" }}>Company</h5>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li>About Us</li>
                        <li>Contact Us</li>
                        <li>Our Services</li>
                        <li>Privacy Policy</li>
                        <li>Terms & Condition</li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
                    <h5 style={{ color: "#fff", marginBottom: "15px" }}>Quick Links</h5>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li>About Us</li>
                        <li>Contact Us</li>
                        <li>Our Services</li>
                        <li>Privacy Policy</li>
                        <li>Terms & Condition</li>
                    </ul>
                </div>

                {/* Contact */}
                <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
                    <h5 style={{ color: "#fff", marginBottom: "15px" }}>Contact</h5>
                    <p>
                        <FaMapMarkerAlt /> 123 Street, New York, USA
                    </p>
                    <p>
                        <FaPhone /> +012 345 67890
                    </p>
                    <p>
                        <FaEnvelope /> info@example.com
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <FaFacebookF style={{ cursor: "pointer" }} />
                        <FaGithub style={{ cursor: "pointer" }} />
                        <FaLinkedinIn style={{ cursor: "pointer" }} />
                    </div>
                </div>

                {/* Newsletter */}
                <div style={{ flex: "1 1 200px", marginBottom: "20px" }}>
                    <h5 style={{ color: "#fff", marginBottom: "15px" }}>Newsletter</h5>
                    <p>Dolor amet sit justo amet elit, clita ipsum elit est.</p>
                    <div style={{ display: "flex" }}>
                        <input
                            type="email"
                            placeholder="Your email"
                            style={{
                                flex: 1,
                                padding: "5px 10px",
                                border: "none",
                                borderRadius: "3px 0 0 3px",
                            }}
                        />
                        <button
                            style={{
                                padding: "5px 15px",
                                border: "none",
                                backgroundColor: "#00c853",
                                color: "#fff",
                                borderRadius: "0 3px 3px 0",
                                cursor: "pointer",
                            }}
                        >
                            SignUp
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    borderTop: "1px solid #333",
                    paddingTop: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    fontSize: "14px",
                }}
            >
                <div>
                    © Your Site Name, All Right Reserved. Designed By HTML Codex. Distributed By ThemeWagon
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                    <span>Home</span>
                    <span>Cookies</span>
                    <span>Help</span>
                    <span>FAQs</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
