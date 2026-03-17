const { fetchAll } = require('./fetcher');
const { clusterNews } = require('./cluster');
const { summarizeCluster } = require('./summarize');
const { saveClusters } = require('./db');

// Wait helper to avoid hitting Gemini free-tier rate limits (429 Too Many Requests)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runPipeline() {
    console.log('--- STARTING VOICE NEWS PIPELINE ---');
    try {
        // 1. Fetch RSS
        const rawItems = await fetchAll();
        if (rawItems.length === 0) {
            console.log('No news items found. Exiting.');
            return;
        }

        // 2. Cluster
        const clusters = await clusterNews(rawItems);
        console.log(`Clustered into ${clusters.length} groups.`);

        // 3. Sort by source density (prioritize multi-source news)
        // More items in a cluster = more sources covered = higher priority
        clusters.sort((a, b) => b.items.length - a.items.length);

        // 4. Summarize each cluster
        // Top 10 clusters — safe since pipeline runs every 2-12h, quota resets between runs
        const topClusters = clusters.slice(0, 10);
        const processedClusters = [];

        for (const cluster of topClusters) {
            try {
                const summary = await summarizeCluster(cluster);
                processedClusters.push({
                    ...cluster,
                    summary: summary
                });
                // Wait 30s between calls — Gemini free-tier retryDelay is 30s
                console.log('Waiting 30s to respect Gemini free-tier rate limit...');
                await sleep(30000);
            } catch (err) {
                console.error(`Failed to summarize cluster ${cluster.clusterTitle}:`, err.message);
            }
        }

        // 4. Save to DB
        if (processedClusters.length > 0) {
            await saveClusters(processedClusters);
        }

        console.log('--- PIPELINE COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('Pipeline failed:', error.message);
    }
}

runPipeline();
