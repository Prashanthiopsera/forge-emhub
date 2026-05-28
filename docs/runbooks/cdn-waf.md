# CDN / WAF issues

1. Cloudflare dashboard → Security → Events — identify blocked requests.
2. Temporarily lower WAF sensitivity or add allow rule for corporate IP range.
3. Verify SPA routing: all paths serve `index.html` for emhub host.
