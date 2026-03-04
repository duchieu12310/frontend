import React from "react";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import styles from './footer.module.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles['footer-container']}>
            <div className={styles['footer-content']}>
                {/* Company */}
                <div className={styles.column}>
                    <h5>Company</h5>
                    <ul>
                        <li>About Us</li>
                        <li>Contact Us</li>
                        <li>Our Services</li>
                        <li>Privacy Policy</li>
                        <li>Terms & Condition</li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div className={styles.column}>
                    <h5>Quick Links</h5>
                    <ul>
                        <li>About Us</li>
                        <li>Contact Us</li>
                        <li>Our Services</li>
                        <li>Privacy Policy</li>
                        <li>Terms & Condition</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className={styles.column}>
                    <h5>Contact</h5>
                    <p>
                        <FaMapMarkerAlt /> 123 Street, New York, USA
                    </p>
                    <p>
                        <FaPhone /> +012 345 67890
                    </p>
                    <p>
                        <FaEnvelope /> info@example.com
                    </p>
                    <div className={styles['social-links']}>
                        <FaFacebookF />
                        <FaGithub />
                        <FaLinkedinIn />
                    </div>
                </div>

                {/* Newsletter */}
                <div className={styles.column}>
                    <h5>Newsletter</h5>
                    <p>Dolor amet sit justo amet elit, clita ipsum elit est.</p>
                    <div className={styles['newsletter-form']}>
                        <input
                            type="email"
                            placeholder="Your email"
                        />
                        <button>
                            SignUp
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles['footer-bottom']}>
                <div>
                    © {currentYear} JobEntry. All Right Reserved. Designed By HTML Codex.
                </div>
                <div className={styles.links}>
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
