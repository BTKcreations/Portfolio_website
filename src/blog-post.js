import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// Configure marked with highlight extension
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
}));

marked.setOptions({
    breaks: true,
    gfm: true
});

// Custom Cursor
const cursor = document.querySelector('#custom-cursor');
if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

// Hover effects for cursor
const addCursorHover = (elements) => {
    if (!cursor) return;
    elements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2.5)';
            cursor.style.background = 'rgba(37, 99, 235, 0.1)';
            cursor.style.border = '1px solid var(--primary-color)';
            cursor.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'var(--primary-color)';
            cursor.style.border = 'none';
            cursor.style.opacity = '0.3';
        });
    });
};

addCursorHover(document.querySelectorAll('a, button, .btn'));

// Reading Progress
window.addEventListener('scroll', () => {
    const progress = document.querySelector('#read-progress');
    if (!progress) return;
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progress.style.width = scrollPercent + '%';
});

async function renderPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    const blogContent = document.querySelector('#blog-content');
    const blogTitle = document.querySelector('#blog-title');
    const blogDate = document.querySelector('#blog-date');
    const readTime = document.querySelector('#read-time');
    const tocNav = document.querySelector('#toc-nav');

    if (!postId) {
        if (blogContent) blogContent.innerHTML = '<h2>Post not found</h2><a href="/index.html">Go Home</a>';
        return;
    }

    try {
        const metaResponse = await fetch('/content/blog-meta.json');
        const blogs = await metaResponse.json();
        const blog = blogs.find(b => b.id === postId);

        if (!blog) {
            if (blogContent) blogContent.innerHTML = '<h2>Post not found</h2>';
            return;
        }

        // Update Hero and Metadata
        document.title = `${blog.title} | BSTK Blog`;
        if (blogTitle) blogTitle.innerText = blog.title;
        if (blogDate) blogDate.innerText = blog.date;

        // Fetch Markdown
        const mdPath = `/content/blogs/${blog.file}`;
        const mdResponse = await fetch(mdPath);
        if (!mdResponse.ok) throw new Error(`Failed to fetch markdown: ${mdResponse.status}`);
        
        const text = await mdResponse.text();
        
        // Remove frontmatter
        const cleanText = text.replace(/^---[\s\S]*?---/, '');
        
        // Calculate read time
        const words = cleanText.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        if (readTime) readTime.innerText = `${minutes} min read`;

        // Parse and Inject
        if (blogContent) {
            blogContent.innerHTML = marked.parse(cleanText);
            
            // Apply cursor effects to new links in content
            addCursorHover(blogContent.querySelectorAll('a'));

            // Generate TOC
            const headings = blogContent.querySelectorAll('h2, h3');
            const tocLinks = [];
            
            if (tocNav) {
                tocNav.innerHTML = ''; // Clear loading
                headings.forEach((heading, index) => {
                    const id = `heading-${index}`;
                    heading.id = id;
                    const link = document.createElement('a');
                    link.href = `#${id}`;
                    link.innerText = heading.innerText;
                    link.classList.add(`toc-${heading.tagName.toLowerCase()}`);
                    
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = document.getElementById(id);
                        const offset = 120; // Room for navbar
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = target.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    });
                    
                    tocNav.appendChild(link);
                    tocLinks.push({ id, link, heading });
                });
            }

            // Scroll-Spy Logic
            window.addEventListener('scroll', () => {
                let current = '';
                headings.forEach(heading => {
                    const sectionTop = heading.offsetTop;
                    if (window.scrollY >= sectionTop - 150) {
                        current = heading.id;
                    }
                });

                tocLinks.forEach(item => {
                    item.link.classList.remove('active');
                    if (item.id === current) {
                        item.link.classList.add('active');
                    }
                });
            });
        }

        // Copy Link logic
        const copyBtn = document.querySelector('#copy-link');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                navigator.clipboard.writeText(window.location.href);
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied!';
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            });
        }

    } catch (err) {
        console.error('Failed to load blog post:', err);
        if (blogContent) blogContent.innerHTML = `<div style="text-align:center; padding: 40px;"><h2>Post could not be loaded</h2><p>${err.message}</p></div>`;
    }
}

renderPost();
