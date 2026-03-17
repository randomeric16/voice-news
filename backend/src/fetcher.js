const Parser = require('rss-parser');
const parser = new Parser();

const FEEDS = [
    { name: 'VnExpress', url: 'https://vnexpress.net/rss/tin-moi-nhat.rss' },
    { name: 'Tuổi Trẻ', url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss' },
    { name: 'Thanh Niên', url: 'https://thanhnien.vn/rss/home.rss' },
    { name: 'VietnamNet', url: 'https://vietnamnet.vn/rss/tin-moi-nhat.rss' },
    { name: 'Nhân Dân', url: 'https://nhandan.vn/rss/tin-moi-nhat.rss' }
];

async function fetchAll() {
    console.log('Starting to fetch RSS feeds...');
    const allItems = [];

    for (const feed of FEEDS) {
        try {
            console.log(`Fetching ${feed.name}...`);
            const response = await parser.parseURL(feed.url);
            
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
