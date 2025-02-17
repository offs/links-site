# Links Site

A modern link-in-bio platform built with Next.js, MongoDB, and Tailwind CSS.

## Features

- 🔐 Secure authentication
- 🎨 Customizable links
- 📱 Fully responsive design
- 🖼️ Image upload with optimization
- 👤 User management for admins
- 🚀 Optimized for performance

## Screenshots

<details>
  <summary>Click to expand</summary>

  ![Main Page](https://i.imgur.com/r1wBlMY.png)
  ![Profile](https://i.imgur.com/HPs39qb.png)
  ![Settings 1](https://i.imgur.com/KqjGoI6.png)
  ![Settings 2](https://i.imgur.com/cndN1Sn.png)
</details>

## Setup

1. Clone and install:

```bash
git clone https://github.com/offs/links-site.git
cd links-site
npm install
```

2. Set up environment:

```bash
cp .env.example .env.local
```

3. Configure required variables in `.env.local`:

- MongoDB connection
- NextAuth secret
- Cloudinary credentials

4. Development:

```bash
npm run dev
```

5. Production:

```bash
npm run build
npm start
```

## Security

- Password validation
- Rate limiting
- Input sanitization
- Secure sessions
- XSS protection
- CSRF protection

## Testing

```bash
npm test
```

## License

MIT License - see [LICENSE](LICENSE)
