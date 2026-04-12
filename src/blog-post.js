import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

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
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Reading Progress
window.addEventListener('scroll', () => {
    const progress = document.querySelector('#read-progress');
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (progress) progress.style.width = scrollPercent + '%';
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
        blogContent.innerHTML = '<h2>Post not found</h2><a href="/index.html">Go Home</a>';
        return;
    }

    try {
        const metaResponse = await fetch('/src/content/blog-meta.json');
        const blogs = await metaResponse.json();
        const blog = blogs.find(b => b.id === postId);

        if (!blog) {
            blogContent.innerHTML = '<h2>Post not found</h2>';
            return;
        }

        // Update Hero and Metadata
        document.title = `${blog.title} | BSTK Blog`;
        blogTitle.innerText = blog.title;
        blogDate.innerText = blog.date;

        // Fetch Markdown
        const mdResponse = await fetch(`/src/content/blogs/${blog.file}`);
        const text = await mdResponse.text();
        
        // Remove frontmatter
        const cleanText = text.replace(/^---[\s\S]*?---/, '');
        
        // Calculate read time
        const words = cleanText.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        readTime.innerText = `${minutes} min read`;

        // Parse and Inject
        blogContent.innerHTML = marked.parse(cleanText);

        // Generate TOC
        const headings = blogContent.querySelectorAll('h2, h3');
        const tocLinks = [];
        
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

        // Copy Link logic
        document.querySelector('#copy-link').addEventListener('click', (e) => {
            navigator.clipboard.writeText(window.location.href);
            e.target.innerText = 'Copied!';
            setTimeout(() => e.target.innerText = 'Copy Link', 2000);
        });

    } catch (err) {
        console.error('Failed to load blog post:', err);
        blogContent.innerHTML = '<h2>Error loading post</h2>';
    }
}

renderPost();
