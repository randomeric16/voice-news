const Parser = require('rss-parser');
const fetch = require('node-fetch');
const parser = new Parser();

const FEEDS = [
    { name: 'VnExpress', url: 'https://vnexpress.net/rss/tin-moi-nhat.rss' },
    { name: 'Tuổi Trẻ', url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss' },
    { name: 'Thanh Niên', url: 'https://thanhnien.vn/rss/home.rss' },
    { name: 'VietnamNet', url: 'https://vietnamnet.vn/home.rss' },
    { name: 'Nhân Dân', url: 'https://nhandan.vn/rss/home.rss' }
];

async function fetchAll() {
    console.log('Starting to fetch RSS feeds...');
    const allItems = [];

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
    };

    for (const feed of FEEDS) {
        try {
            console.log(`Fetching ${feed.name}...`);
            const res = await fetch(feed.url, { headers });
            if (!res.ok) throw new Error(`Status code ${res.status}`);
            
            const xml = await res.text();
            // Trim to avoid "Non-whitespace before first tag" errors
            const response = await parser.parseString(xml.trim());
            
            const items = response.items.map(item => {
                // Improved image extraction
                let image = '';
                
                // 1. Check for enclosure tag (standard RSS image)
                if (item.enclosure && item.enclosure.url) {
                    image = item.enclosure.url;
                } 
                // 2. Check for media:content (common in some feeds)
                else if (item['media:content'] && item['media:content'].$.url) {
                    image = item['media:content'].$.url;
                }
                // 3. Extract from HTML description or content
                else {
                    const htmlContent = item.content || item.description || item.contentSnippet || '';
                    const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/i);
                    if (imgMatch) {
                        image = imgMatch[1];
                    }
                }

                return {
                    title: item.title,
                    link: item.link,
                    description: (item.contentSnippet || item.content || "").replace(/<[^>]*>?/gm, '').trim(),
                    pubDate: item.pubDate,
                    source: feed.name,
                    image: image
                };
            });
            
            allItems.push(...items);
        } catch (error) {
            console.error(`Error fetching ${feed.name}:`, error.message);
        }
    }

    console.log(`Fetched total ${allItems.length} items.`);
    return allItems;
}

module.exports = { fetchAll };
