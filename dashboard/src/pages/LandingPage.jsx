import { useState, useEffect } from 'react'
import axios from 'axios'
import './LandingPage.css'
import kanGeiLogo from './kangei-logo.png'  

const CATEGORIES = ['All','Rice Bowls', 'Ramen & Noodles', 'Taiyaki', 'Combo Meals', 'Burgers', 'Cold Noodles', 'Dango', 'Milk Tea', 'Drinks']

function LandingPage() {
  const [menuItems, setMenuItems]           = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [menuLoading, setMenuLoading]       = useState(true)
  const [navScrolled, setNavScrolled]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch only available items for public view
    axios.get('http://localhost:1337/menu-db')
      .then((res) => setMenuItems(res.data))
      .catch(console.error)
      .finally(() => setMenuLoading(false))

    const onScroll = () => setNavScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory)

  return (
    <div className="landing">

      {/* ═══════════ NAVBAR */}
      <nav className={`navbar ${navScrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__brand">
          <img src={kanGeiLogo} alt="Kan-Gei Logo" className="navbar__logo-img" /> 
          <div>
            <span className="navbar__name">Kan-Gei</span>
            <span className="navbar__tagline">Japanese Restaurant</span>
          </div>
        </div>

        <ul className={`navbar__links ${mobileMenuOpen ? 'navbar__links--open' : ''}`}>
          {['about', 'menu', 'location'].map(id => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setMobileMenuOpen(false)}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
          <li>
            <a href="/login" className="navbar__admin-btn" onClick={() => setMobileMenuOpen(false)}>
              Admin Login
            </a>
          </li>
        </ul>

        <button className="navbar__hamburger" onClick={() => setMobileMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* ═══════════ HERO */}
      <section id="home" className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__pre">Authentic Japanese Cuisine</p>
          <h1 className="hero__title">
             <img src={kanGeiLogo} alt="Kan-Gei" className="hero__logo-img" />
            <span className="hero__title-en">Kan-Gei</span>
          </h1>
          <p className="hero__subtitle">
            Experience the art of Japanese dining in the heart of Solano, Nueva Vizcaya
          </p>
          <div className="hero__cta">
            <a href="#menu" className="btn btn--red">Explore Our Menu</a>
            <a href="#about" className="btn btn--outline">Our Story</a>
          </div>
        </div>
        <div className="hero__scroll-hint"><span>↓</span></div>
      </section>

      {/* ═══════════ ABOUT */}
      <section id="about" className="section about">
        <div className="container">
          <div className="section__header">
            <p className="section__pre">Our Story</p>
            <h2 className="section__title">About Kan-Gei</h2>
            <div className="section__divider" />
          </div>
          <div className="about__grid">
            <div className="about__text">
              <p>
                <strong>Kan-Gei</strong> (甘幸) is a beloved Japanese restaurant located in Solano,
                Nueva Vizcaya, Philippines. We bring the authentic flavors of Japan to the heart
                of Cagayan Valley crafted with care, served with warmth.
              </p>
              <p>
                Our menu features a wide selection of ramen, rice bowls, and more each
                dish prepared with fresh ingredients and traditional techniques passed down through
                generations of Japanese culinary artistry.
              </p>
              <p>
                Whether you&apos;re joining us for a quick lunch, a family dinner, or a special
                celebration, Kan-Gei promises a dining experience that transports you to the streets of Tokyo.
              </p>
              <a href="https://www.facebook.com/KanGeiJap/" target="_blank" rel="noreferrer"
                className="btn btn--red" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                Follow Us on Facebook
              </a>
            </div>
            <div className="about__timeline">
              {[
                { year: 'Est.', label: 'Founded',       desc: 'Kan-Gei opens its doors in Solano, Nueva Vizcaya, bringing authentic Japanese cuisine to the region.' },
                { year: '🍜',   label: 'Ramen Corner',  desc: 'We introduced our signature slow-cooked ramen broths, becoming a local favorite.' },
                { year: '🌟',   label: 'Today',         desc: 'Kan-Gei continues to serve Solano with fresh, authentic Japanese dishes every single day.' },
              ].map((item, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot">{item.year}</div>
                  <div className="timeline-body">
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MENU */}
      <section id="menu" className="section menu-section">
        <div className="container">
          <div className="section__header">
            <p className="section__pre">What We Serve</p>
            <h2 className="section__title">Our Menu</h2>
            <div className="section__divider" />
          </div>

          <div className="menu__filter">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={`filter-btn ${activeCategory === cat ? 'filter-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>

          {menuLoading ? (
            <div className="menu__loading">
              <div className="spinner" />
              <p>Loading menu…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="menu__empty">
              <span>🍱</span>
              <p>No items in this category yet.</p>
            </div>
          ) : (
            <div className="menu__grid">
              {filtered.map(item => (
                <div className="menu-card" key={item._id}>
                  <div className="menu-card__img-wrap">
                    {item.photo ? (
                      // item.photo is "/uploads/dish-xxx.jpg"
                      // Vite proxy forwards /uploads/* to localhost:1337
                      <img src={item.photo} alt={item.name} className="menu-card__img" />
                    ) : (
                      <div className="menu-card__img-placeholder">🍽️</div>
                    )}
                    <span className="menu-card__category">{item.category}</span>
                  </div>
                  <div className="menu-card__body">
                    <div className="menu-card__top">
                      <h3 className="menu-card__name">{item.name}</h3>
                      <span className="menu-card__price">₱{Number(item.price).toFixed(2)}</span>
                    </div>
                    <p className="menu-card__desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ LOCATION */}
      <section id="location" className="section location-section">
        <div className="container">
          <div className="section__header">
            <p className="section__pre">Find Us</p>
            <h2 className="section__title">Location &amp; Hours</h2>
            <div className="section__divider" />
          </div>
          <div className="location__grid">
            <div className="location__map">
              <iframe
                title="Kan-Gei Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15326.5!2d121.1954!3d16.5197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3390122f2f2f2f2f%3A0x0!2sSolano%2C%20Nueva%20Vizcaya!5e0!3m2!1sen!2sph!4v1700000000000"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
              />
            </div>
            <div className="location__info">
              {[
                { icon: '📍', label: 'Address', value: '50, Cornwall Bldg, General Santos St, Poblacion North, Solano, Nueva Vizcaya, Philippines' },
                { icon: '📘', label: 'Facebook', value: 'facebook.com/KanGeiJap', href: 'https://www.facebook.com/KanGeiJap/' },
              ].map(item => (
                <div className="info-row" key={item.label}>
                  <div className="info-row__icon">{item.icon}</div>
                  <div>
                    <p className="info-row__label">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="info-row__value info-row__value--link">
                        {item.value}
                      </a>
                    ) : (
                      <p className="info-row__value">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="info-row">
                <div className="info-row__icon">🕐</div>
                <div>
                  <p className="info-row__label">Hours</p>
                  <div className="hours-table">
                    {[
                      { day: 'Mon – Fri', time: '10:00 AM – 9:00 PM' },
                      { day: 'Saturday',  time: '10:00 AM – 10:00 PM' },
                      { day: 'Sunday',    time: '11:00 AM – 9:00 PM' },
                    ].map(h => (
                      <div className="hours-row" key={h.day}>
                        <span>{h.day}</span><span>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__brand">
            <img src={kanGeiLogo} alt="Kan-Gei Logo" className="footer__logo-img" /> 
            <p className="footer__tagline">Kan-Gei</p>
            <p className="footer__tagline">Authentic Japanese Cuisine</p>
            <p className="footer__sub">Solano, Nueva Vizcaya, Philippines</p>
          </div>
          <div className="footer__social">
            <a href="https://www.facebook.com/KanGeiJap/" target="_blank" rel="noreferrer"
              className="social-btn social-btn--fb">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
          <div className="footer__bottom">
            <p>© 2026 Kan-Gei Japanese Restaurant · Solano, Nueva Vizcaya</p>
            <a href="/login" className="footer__admin-link">Admin Login</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
