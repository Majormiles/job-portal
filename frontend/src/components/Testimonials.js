import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Marco Kihn',
      role: 'Happy Client',
      rating: 5,
      title: 'Amazing services',
      text: 'Metus faucibus sed turpis lectus feugiat tincidunt. Rhoncus sed tristique in dolor. Mus etiam et vestibulum venenatis',
    },
    {
      id: 2,
      name: 'Kristin Hester',
      role: 'Happy Client',
      rating: 5,
      title: 'Everything simple',
      text: 'Mus etiam et vestibulum venenatis viverra ut. Elit morbi bibendum ullamcorper augue faucibus',
    },
    {
      id: 3,
      name: 'Zion Cisneros',
      role: 'Happy Client',
      rating: 5,
      title: 'Awesome, thank you!',
      text: 'Rhoncus sed tristique in dolor. Mus etiam et vestibulum venenatis viverra ut. Elit morbi bibendum ullamcorper augue faucibus. Nulla et tempor montes',
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Testimonials from Our Customers</h1>
        <p style={styles.subtitle}>
          At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum id...
        </p>
      </div>
      
      <div style={styles.testimonialGrid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} style={styles.testimonialCard}>
            <div style={styles.ratingContainer}>
              {[...Array(testimonial.rating)].map((_, index) => (
                <span key={index} style={styles.star}>★</span>
              ))}
            </div>
            <h3 style={styles.testimonialTitle}>{testimonial.title}</h3>
            <p style={styles.testimonialText}>{testimonial.text}</p>
            <div style={styles.quoteContainer}>
              <span style={styles.quoteSymbol}>"</span>
            </div>
            <div style={styles.testimonialAuthor}>
              <div style={styles.avatarContainer}>
                <div style={styles.avatar}></div>
              </div>
              <div style={styles.authorInfo}>
                <h4 style={styles.authorName}>{testimonial.name}</h4>
                <p style={styles.authorRole}>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20%',
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif',
    width: '100%', 
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#333',
    maxWidth: '700px',
    margin: '0 auto',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    width: '100%',
  },
  testimonialCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  ratingContainer: {
    display: 'flex',
    marginBottom: '16px',
  },
  star: {
    color: '#FFD700',
    fontSize: '24px',
    marginRight: '4px',
  },
  testimonialTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '12px',
  },
  testimonialText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  quoteContainer: {
    position: 'absolute',
    right: '24px',
    bottom: '40px',
  },
  quoteSymbol: {
    fontSize: '60px',
    color: '#3D9D9D',
    opacity: '0.3',
    fontFamily: 'Georgia, serif',
    lineHeight: '1',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
  },
  avatarContainer: {
    marginRight: '12px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px 0',
  },
  authorRole: {
    fontSize: '14px',
    color: '#777',
    margin: 0,
  },
  // Media queries for responsiveness
  '@media (max-width: 768px)': {
    testimonialGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    },
  },
  '@media (max-width: 480px)': {
    testimonialGrid: {
      gridTemplateColumns: '1fr',
    },
    title: {
      fontSize: '28px',
    },
  },
};

export default TestimonialsSection;