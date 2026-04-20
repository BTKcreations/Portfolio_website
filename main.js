import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Configure marked
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Project Data
const projects = [
    {
        title: "SecureVault - Cloud Encrypted File Sharing",
        description: "Built a secure file-sharing platform with AES-256 encryption-at-rest, JWT auth, Bcrypt hashing, and owner-only RBAC access.",
        tech: ["React", "Node.js", "Express", "MongoDB", "AES-256", "JWT"],
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "ShopSmart AI - E-commerce Platform",
        description: "Developed an AI-driven e-commerce app with context-aware recommendations, secure admin controls, and real-time inventory sync.",
        tech: ["React", "Node.js", "Express", "PostgreSQL", "OpenAI API"],
        image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Snooker Billing & Management System",
        description: "Architected a billing solution with role-based authentication, automated billing logic, and centralized revenue tracking.",
        tech: ["Next.js", "Firebase", "Tailwind"],
        image: "https://images.unsplash.com/photo-1594474139194-42f1cc053073?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Multi App Dashboard (PWA)",
        description: "Modular dashboard integrating productivity tools with Google OAuth and offline support.",
        tech: ["HTML/CSS", "JavaScript", "Service Workers"],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Fact vs Fiction - AI Fact-Checking System",
        description: "Implemented a 4-step intelligence pipeline with web search, Wikipedia, ChromaDB RAG lookup, and Ollama verdict generation.",
        tech: ["FastAPI", "ChromaDB", "spaCy", "Ollama", "React", "Chrome Extension"],
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
    }
];

const skills = [
    { name: "Programming & DSA", items: ["Python", "Java", "JavaScript", "C", "OOPS", "Data Structures & Algorithms"] },
    { name: "Web Development", items: ["HTML5", "CSS3", "React.js", "Next.js", "Tailwind CSS", "PWA", "Chrome Extension Dev"] },
    { name: "Backend & APIs", items: ["Node.js", "Express.js", "FastAPI", "Django", "REST APIs"] },
    { name: "Databases & Vector DB", items: ["PostgreSQL", "MongoDB", "SQLite", "Firebase", "ChromaDB"] },
    { name: "AI/ML & NLP", items: ["Machine Learning", "AI Workflows", "RAG Architecture", "LLM Orchestration (Ollama)", "spaCy"] },
    { name: "Security & DevOps", items: ["AES-256", "Bcrypt", "JWT", "RBAC", "SDLC", "Agile", "Git", "GitHub", "VS Code"] }
];

// Initialize Reveal Animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Custom Cursor
const cursor = document.querySelector('#custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.style.transform = 'scale(0.8)');
document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');

// Hover effects for cursor
const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2.5)';
        cursor.style.background = 'rgba(255,255,255,0.1)';
        cursor.style.border = '1px solid white';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.background = 'white';
        cursor.style.border = 'none';
    });
});

// Render Projects
const projectsGrid = document.querySelector('.projects-grid');
if (projectsGrid) {
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card glass reveal';
        card.innerHTML = `
            <div class="project-img" style="background-image: url('${project.image}')"></div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
        `;
        projectsGrid.appendChild(card);
        revealObserver.observe(card);
    });
}

// Render Skills
const skillsGrid = document.querySelector('.skills-grid');
if (skillsGrid) {
    skills.forEach(skillSet => {
        const div = document.createElement('div');
        div.className = 'skill-card glass reveal';
        div.innerHTML = `
            <h3>${skillSet.name}</h3>
            <div class="skill-items">
                ${skillSet.items.map(s => `<span class="skill-item">${s}</span>`).join('')}
            </div>
        `;
        skillsGrid.appendChild(div);
        revealObserver.observe(div);
    });
}

// Blog System
async function initBlog() {
    try {
        const response = await fetch('/content/blog-meta.json');
        const blogs = await response.json();
        const blogList = document.querySelector('#blog-list');
        const blogPostView = document.querySelector('#blog-post-view');
        const blogContent = document.querySelector('#blog-content');
        const backBtn = document.querySelector('#back-to-blog');

        if (blogList) {
            blogs.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'project-card glass reveal';
                card.innerHTML = `
                    <div class="project-img" style="background-image: url('${blog.image}')"></div>
                    <div class="project-info">
                        <span class="tech-tag">${blog.date}</span>
                        <h3>${blog.title}</h3>
                        <p>${blog.summary}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `/blog.html?post=${blog.id}`;
                });
                blogList.appendChild(card);
                revealObserver.observe(card);
            });
        }
    } catch (err) {
        console.error('Blog initialization failed:', err);
    }
}

initBlog();

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('#navbar');
    if (window.scrollY > 50) {
        navbar.style.top = '10px';
        navbar.style.width = '95%';
        navbar.style.background = 'rgba(10, 10, 12, 0.8)';
    } else {
        navbar.style.top = '20px';
        navbar.style.width = '90%';
        navbar.style.background = 'var(--glass-bg)';
    }
});

// Form Submission handling
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerText = 'Message Sent!';
            contactForm.reset();
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// Dynamic text animation for Hero
const heroTitle = document.querySelector('.reveal-text');
if (heroTitle) {
    // Simple reveal animation already handled by CSS/Observer, 
    // but we could add more complex staggered text here.
}
