import React from 'react';
import '../css/NewsBlog.css';
import blog1 from '../../assets/images/blog-1.jpg';
import blog2 from '../../assets/images/blog-2.jpg';

const NewsBlog = () => {
  const articles = [
    {
      id: 1,
      title: "Redefining Workplace Morale: Innovative Tactics for Building Employee Engagement in 2024",
      date: "16 January 2024",
      image: blog1,
      tag: "Career"
    },
    {
      id: 2,
      title: "How To Avoid The Top Six Most Common Job Interview Mistakes",
      date: "05 January 2024",
      image: blog2,
      tag: "Tips"
    }
  ];

  return (
    <section className="news-blog">
      <div className="container">
        <div className="section-header">
          <h2>News and Blog</h2>
          <a href="#" className="view-all">View all</a>
        </div>
        
        <div className="blog-grid">
          {articles.map(article => (
            <div className="blog-card" key={article.id}>
              <div className="blog-image">
                <img src={article.image} alt={article.title} />
                <span className="blog-tag">{article.tag}</span>
              </div>
              <div className="blog-content">
                <span className="blog-date">{article.date}</span>
                <h3 className="blog-title">{article.title}</h3>
                <a href="#" className="read-more">Read more</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsBlog;